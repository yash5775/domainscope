import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import MetricsBar from './components/MetricsBar';
import ResultsTable from './components/ResultsTable';
import InspectModal from './components/InspectModal';
import Toast from './components/Toast';
import { 
  generateTargetDomains, 
  verifyDomain, 
  getTldMeta, 
  exportToCsv, 
  exportToPdf 
} from './services/domainEngine';
import './App.css';

export default function App() {
  const [inputText, setInputText] = useState(
    'neuralflow\ncloudpulse\nquantumspark\nhyperlaunch\nbytevault\ninframind'
  );
  const [selectedTlds, setSelectedTlds] = useState(['.com', '.ai']);
  const [concurrency, setConcurrency] = useState(5);

  // Runner state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState({ currentDomain: '', percent: 0, checked: 0, total: 0 });
  
  // Results: Array of records for reactive sorting/filtering
  const [results, setResults] = useState([]);
  
  // Active Filter & Search
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'available' | 'taken'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Notifications
  const [inspectingRecord, setInspectingRecord] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [hasCopiedAvailable, setHasCopiedAvailable] = useState(false);

  // Refs for asynchronous workers
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const queueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const resultsMapRef = useRef(new Map());

  // Toast dispatch helper
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  // Compute stats
  const availableCount = results.filter((r) => r.status === 'available').length;
  const takenCount = results.filter((r) => r.status === 'taken').length;
  const errorCount = results.filter((r) => r.status === 'error' || r.status === 'rate_limited').length;

  const stats = {
    total: results.length,
    available: availableCount,
    taken: takenCount,
    errors: errorCount
  };

  // --- Parallel Worker Queue Engine ---
  const startEngine = useCallback(async () => {
    // Smart unified target generator (detects exact domains vs keywords automatically)
    const targets = generateTargetDomains(inputText, selectedTlds);
    if (targets.length === 0) {
      showToast("Please enter at least one domain or keyword to check.", "error");
      return;
    }

    queueRef.current = targets;
    currentIndexRef.current = 0;
    isRunningRef.current = true;
    isPausedRef.current = false;
    resultsMapRef.current = new Map();

    setIsRunning(true);
    setIsPaused(false);
    setResults([]);
    setProgress({ currentDomain: '', percent: 0, checked: 0, total: targets.length });

    showToast(`Checking ${targets.length} domains...`);

    const workerCount = Math.min(concurrency, targets.length);
    const workers = [];

    let availableFoundInRun = 0;

    const workerTask = async () => {
      while (currentIndexRef.current < queueRef.current.length && isRunningRef.current) {
        while (isPausedRef.current && isRunningRef.current) {
          await new Promise((r) => setTimeout(r, 200));
        }

        if (!isRunningRef.current) break;

        const idx = currentIndexRef.current++;
        const domain = queueRef.current[idx];

        setProgress((prev) => ({
          ...prev,
          currentDomain: `${domain} (${idx + 1}/${targets.length})`,
          percent: Math.round(((idx + 1) / targets.length) * 100),
          checked: idx + 1
        }));

        try {
          const res = await verifyDomain(domain);
          const meta = getTldMeta(domain);

          const record = {
            domain,
            tld: meta.tld,
            status: res.status,
            price: meta.reg,
            renewal: meta.renew,
            termNote: meta.termNote,
            details: res.details,
            buyUrl: meta.buyUrl(domain),
            raw: res.raw,
            checkedAt: new Date().toLocaleTimeString()
          };

          resultsMapRef.current.set(domain, record);
          setResults((prev) => [record, ...prev.filter((r) => r.domain !== domain)]);

          if (record.status === 'available') {
            availableFoundInRun++;
          }
        } catch (err) {
          console.error("Worker error on domain:", domain, err);
        }
      }
    };

    for (let i = 0; i < workerCount; i++) {
      workers.push(workerTask());
    }

    await Promise.all(workers);

    isRunningRef.current = false;
    setIsRunning(false);

    const finalAvailable = Array.from(resultsMapRef.current.values()).filter((r) => r.status === 'available').length;
    showToast(`Finished. ${finalAvailable} available!`, 'success');

    // Subtle celebration if available domains found
    if (finalAvailable > 0) {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#16a34a', '#0f172a', '#2563eb']
        });
      } catch (e) {}
    }
  }, [inputText, selectedTlds, concurrency, showToast]);

  const pauseEngine = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(isPausedRef.current);
    showToast(isPausedRef.current ? "Paused" : "Resumed");
  };

  const stopEngine = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    showToast("Stopped");
  };

  // Quick Copy Available
  const handleCopyAvailable = () => {
    const available = results.filter((r) => r.status === 'available').map((r) => r.domain);
    if (available.length === 0) {
      showToast("No available domains to copy", "error");
      return;
    }

    navigator.clipboard.writeText(available.join('\n')).then(() => {
      setHasCopiedAvailable(true);
      showToast(`Copied ${available.length} domains!`, 'success');
      setTimeout(() => setHasCopiedAvailable(false), 2000);
    }).catch(() => {
      showToast("Failed to copy", "error");
    });
  };

  // Exports
  const handleExportCsv = () => {
    exportToCsv(results);
    showToast(`Exported ${results.length} domains to CSV`, "success");
  };

  const handleExportPdf = async () => {
    try {
      await exportToPdf(results);
      showToast("Downloaded PDF report", "success");
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  // Keyboard Shortcuts: Cmd/Ctrl + Enter to trigger check
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunningRef.current) {
          startEngine();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startEngine]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        availableCount={availableCount}
        onCopyAvailable={handleCopyAvailable}
        hasCopied={hasCopiedAvailable}
      />

      {/* Main 2-Column Responsive Workbench */}
      <div className="main-grid">
        {/* Left Column: Config Panel */}
        <InputPanel
          inputText={inputText}
          setInputText={setInputText}
          selectedTlds={selectedTlds}
          setSelectedTlds={setSelectedTlds}
          concurrency={concurrency}
          setConcurrency={setConcurrency}
          isRunning={isRunning}
          isPaused={isPaused}
          onStart={startEngine}
          onPause={pauseEngine}
          onStop={stopEngine}
          onToast={showToast}
        />

        {/* Right Column: Stats & Data Table */}
        <div className="results-column">
          <MetricsBar
            stats={stats}
            activeFilter={activeFilter}
            onSelectFilter={(filter) => setActiveFilter(filter)}
          />

          <ResultsTable
            results={results}
            isRunning={isRunning}
            progress={progress}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onInspect={(record) => setInspectingRecord(record)}
            onToast={showToast}
          />
        </div>
      </div>

      {/* RDAP Inspector Modal */}
      {inspectingRecord && (
        <InspectModal
          record={inspectingRecord}
          onClose={() => setInspectingRecord(null)}
          onToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
