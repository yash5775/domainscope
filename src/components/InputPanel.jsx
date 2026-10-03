import React, { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Upload, 
  Check, 
  Layers,
  Search,
  Plus,
  X,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { TLD_CATALOG, TLD_PRICING, generateTargetDomains } from '../services/domainEngine';

const CATEGORIES = ['All', 'Global', 'Tech', 'Creative', 'Business', 'Country'];

export default function InputPanel({
  inputText,
  setInputText,
  selectedTlds,
  setSelectedTlds,
  customTlds = [],
  setCustomTlds = () => {},
  concurrency,
  setConcurrency,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onToast
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const fileInputRef = useRef(null);

  // Clean lines count & total smart generated queries
  const cleanLines = inputText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  const targetDomains = generateTargetDomains(inputText, selectedTlds);
  const totalQueries = targetDomains.length;

  // Unified catalog combining static catalog + user custom TLDs
  const combinedCatalog = useMemo(() => {
    const customList = customTlds.map(tld => ({
      tld,
      category: 'Custom',
      reg: TLD_PRICING[tld]?.reg || 'Standard',
      renew: TLD_PRICING[tld]?.renew || 'Standard',
      termNote: 'User custom extension'
    }));
    return [...TLD_CATALOG, ...customList];
  }, [customTlds]);

  // Clean formatted search term for custom addition
  const cleanQuery = searchQuery.trim().toLowerCase();
  const candidateTld = cleanQuery 
    ? (cleanQuery.startsWith('.') ? cleanQuery : `.${cleanQuery}`)
    : '';
  const isValidCandidate = /^\.[a-z0-9\-]+(\.[a-z]{2,})?$/i.test(candidateTld);
  const candidateExists = combinedCatalog.some(
    item => item.tld.toLowerCase() === candidateTld.toLowerCase()
  );

  // Filtered catalog based on category and search query
  const filteredCatalog = useMemo(() => {
    return combinedCatalog.filter(item => {
      const matchCat = selectedCategory === 'All' 
        ? true 
        : item.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;

      if (!cleanQuery) return true;
      return (
        item.tld.toLowerCase().includes(cleanQuery) ||
        item.category.toLowerCase().includes(cleanQuery)
      );
    });
  }, [combinedCatalog, selectedCategory, cleanQuery]);

  const toggleTld = (tld) => {
    if (selectedTlds.includes(tld)) {
      if (selectedTlds.length <= 1) {
        onToast("At least one extension must remain selected", "error");
        return;
      }
      setSelectedTlds(selectedTlds.filter(t => t !== tld));
    } else {
      setSelectedTlds([...selectedTlds, tld]);
    }
  };

  const handleAddCustomTld = (e) => {
    if (e) e.preventDefault();
    if (!candidateTld || !isValidCandidate) {
      onToast("Please enter a valid extension format (e.g. .xyz or .me)", "error");
      return;
    }
    
    // If not in catalog, add to customTlds
    if (!candidateExists) {
      setCustomTlds(prev => [...prev, candidateTld]);
    }

    // Always select it
    if (!selectedTlds.includes(candidateTld)) {
      setSelectedTlds(prev => [...prev, candidateTld]);
    }

    onToast(`Added and selected ${candidateTld}!`, "success");
    setSearchQuery('');
  };

  const handleDeleteCustomTld = (e, tldToDelete) => {
    e.stopPropagation();
    setCustomTlds(prev => prev.filter(t => t !== tldToDelete));
    setSelectedTlds(prev => {
      const filtered = prev.filter(t => t !== tldToDelete);
      return filtered.length > 0 ? filtered : ['.com'];
    });
    onToast(`Removed custom extension ${tldToDelete}`, "info");
  };

  const handleSelectAllFiltered = () => {
    const newSelected = Array.from(new Set([...selectedTlds, ...filteredCatalog.map(i => i.tld)]));
    setSelectedTlds(newSelected);
    onToast(`Selected ${filteredCatalog.length} extensions`, "info");
  };

  const handleResetDefaults = () => {
    setSelectedTlds(['.com', '.ai']);
    onToast("Reset to default extensions (.com, .ai)", "info");
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInputText(text);
      onToast(`Imported ${file.name} successfully!`, "success");
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-card input-panel-card">
      <div className="card-title">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-secondary" />
          <span>Domain Inputs</span>
        </div>
      </div>

      {/* Smart Textarea with Drag & Drop (Auto-detects keywords vs exact domains) */}
      <div 
        className={`textarea-wrapper ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        <textarea
          className="domain-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter domains or keywords (one per line)..."
          spellCheck="false"
        />

        <div className="textarea-footer">
          <span className="count-label">
            {cleanLines.length} input{cleanLines.length === 1 ? '' : 's'} · {totalQueries} domain{totalQueries === 1 ? '' : 's'}
          </span>

          <label className="upload-link" title="Import list from file">
            <Upload size={12} />
            <span>Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* General Purpose Searchable Extensions Catalog */}
      <div className="tld-catalog-container">
        <div className="section-label">
          <div className="section-label-left">
            <span className="section-label-title">Extensions</span>
            <span className="active-badge">{selectedTlds.length} active</span>
          </div>
          <div className="section-label-actions">
            <motion.button 
              type="button" 
              className="link-action-btn"
              onClick={handleResetDefaults}
              title="Reset to default extensions (.com, .ai)"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </motion.button>
            <motion.button 
              type="button" 
              className="link-action-btn"
              onClick={handleSelectAllFiltered}
              title="Select all visible extensions"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              <Check size={10} strokeWidth={2.5} />
              <span>Select All</span>
            </motion.button>
          </div>
        </div>

        {/* Selected TLDs Summary Chips */}
        <div className="active-tld-pills">
          <AnimatePresence>
            {selectedTlds.map(tld => {
              const price = TLD_PRICING[tld]?.reg || '';
              return (
                <motion.span 
                  key={tld} 
                  className="active-tld-pill"
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -4 }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  layout
                >
                  <span className="pill-name">{tld}</span>
                  {price && <span className="pill-price">{price}</span>}
                  <button
                    type="button"
                    className="pill-remove-btn"
                    onClick={() => toggleTld(tld)}
                    title={`Remove ${tld}`}
                  >
                    <X size={10} />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Search & Custom Input Bar */}
        <form onSubmit={handleAddCustomTld} className="tld-search-bar">
          <div className="search-input-wrapper">
            <Search size={12} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ TLDs or type custom (.me, .store)..."
              className="tld-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Quick-add button if candidate is typed */}
          {candidateTld && isValidCandidate && (
            <motion.button 
              type="submit" 
              className="tld-add-btn"
              title={`Add ${candidateTld} to extensions`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={11} strokeWidth={2.5} />
              <span>Add {candidateTld}</span>
            </motion.button>
          )}
        </form>

        {/* Category Filters */}
        <div className="category-pills-row">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' 
              ? combinedCatalog.length 
              : combinedCatalog.filter(i => i.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <motion.button
                key={cat}
                type="button"
                className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                {cat} <span className="cat-count">{count}</span>
              </motion.button>
            );
          })}
          {customTlds.length > 0 && (
            <motion.button
              type="button"
              className={`cat-pill ${selectedCategory === 'Custom' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Custom')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              Custom <span className="cat-count">{customTlds.length}</span>
            </motion.button>
          )}
        </div>

        {/* Scrollable Catalog Grid */}
        <div className="catalog-scroll-grid">
          {filteredCatalog.map(item => {
            const isSelected = selectedTlds.includes(item.tld);
            const isCustom = item.category === 'Custom';
            return (
              <motion.div
                key={item.tld}
                className={`catalog-tld-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleTld(item.tld)}
                title={`${item.tld} — ${item.category} (${item.termNote})`}
                layout
              >
                <div className="card-top-row">
                  <span className="card-tld-name">{item.tld}</span>
                  <div className="card-right-action">
                    {isCustom ? (
                      <button
                        type="button"
                        className="custom-tld-del-btn"
                        onClick={(e) => handleDeleteCustomTld(e, item.tld)}
                        title="Delete custom TLD"
                      >
                        <Trash2 size={10} />
                      </button>
                    ) : (
                      <div className={`selection-indicator ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-price-row">
                  <span className="card-price">{item.reg}</span>
                  <span className="card-cat-tag">{item.category}</span>
                </div>
              </motion.div>
            );
          })}
          {filteredCatalog.length === 0 && (
            <div className="empty-catalog-message">
              <span>No extensions matching "{searchQuery}"</span>
              {candidateTld && isValidCandidate && (
                <motion.button
                  type="button"
                  className="empty-add-btn"
                  onClick={handleAddCustomTld}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={12} /> Add "{candidateTld}"
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Speed Setting */}
      <div className="settings-row">
        <span>Checking Speed:</span>
        <div className="concurrency-picker">
          <select 
            value={concurrency}
            onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
            disabled={isRunning}
          >
            <option value={3}>Gentle (3 parallel)</option>
            <option value={5}>Standard (5 parallel)</option>
            <option value={8}>Turbo (8 parallel)</option>
          </select>
        </div>
      </div>

      {/* Primary Action Button */}
      {!isRunning ? (
        <motion.button 
          type="button" 
          className="primary-btn" 
          onClick={onStart}
          disabled={cleanLines.length === 0}
          whileHover={cleanLines.length > 0 ? { scale: 1.01 } : {}}
          whileTap={cleanLines.length > 0 ? { scale: 0.98 } : {}}
        >
          <Play size={13} fill="currentColor" />
          <span>Check Domains</span>
          <span className="btn-key-hint">⌘↵</span>
        </motion.button>
      ) : (
        <div className="btn-group-running">
          <motion.button 
            type="button" 
            className="btn-secondary flex-1" 
            onClick={onPause}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </motion.button>
          <motion.button 
            type="button" 
            className="btn-stop" 
            onClick={onStop}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Square size={13} fill="currentColor" />
            <span>Stop</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
