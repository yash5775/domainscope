import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Layers
} from 'lucide-react';
import { TLD_PRICING, PRESET_LISTS, generateTargetDomains } from '../services/domainEngine';

export default function InputPanel({
  inputText,
  setInputText,
  selectedTlds,
  setSelectedTlds,
  concurrency,
  setConcurrency,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onStop,
  onToast
}) {
  const [showMoreTlds, setShowMoreTlds] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Clean lines count & total smart generated queries
  const cleanLines = inputText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  const targetDomains = generateTargetDomains(inputText, selectedTlds);
  const totalQueries = targetDomains.length;

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
        
        {/* Compact Presets */}
        <div className="preset-group">
          {Object.entries(PRESET_LISTS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              className="preset-btn"
              onClick={() => {
                setInputText(preset.words.join('\n'));
                onToast(`Loaded ${preset.label}!`);
              }}
              title={`Load ${preset.label} samples`}
            >
              {preset.label}
            </button>
          ))}
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
          placeholder="Enter brand keywords (e.g. cloudpulse) or exact domains (e.g. stripe.com)..."
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

      {/* Target Extensions Selector */}
      <div className="tld-selector-container">
        <div className="section-label">
          <span>Extensions</span>
          <span className="tld-label-hint">Registry Price</span>
        </div>

        <div className="tld-chips-grid">
          {/* .com Chip */}
          <div 
            className={`tld-chip ${selectedTlds.includes('.com') ? 'active' : ''}`}
            onClick={() => toggleTld('.com')}
          >
            <div className="tld-info">
              <span className="tld-name">.com</span>
              <span className="tld-price">{TLD_PRICING['.com'].reg}</span>
            </div>
            <div className="tld-check-icon">
              {selectedTlds.includes('.com') && <Check size={11} strokeWidth={3} />}
            </div>
          </div>

          {/* .ai Chip */}
          <div 
            className={`tld-chip ${selectedTlds.includes('.ai') ? 'active' : ''}`}
            onClick={() => toggleTld('.ai')}
          >
            <div className="tld-info">
              <span className="tld-name">.ai</span>
              <span className="tld-price">{TLD_PRICING['.ai'].reg}</span>
            </div>
            <div className="tld-check-icon">
              {selectedTlds.includes('.ai') && <Check size={11} strokeWidth={3} />}
            </div>
          </div>
        </div>

        {/* Expandable Extra Extensions */}
        <div className="more-tlds-section">
          <div 
            className="more-tlds-header"
            onClick={() => setShowMoreTlds(!showMoreTlds)}
          >
            <span>+ Add extensions (.io, .co, .net, .org, .dev, .in)</span>
            {showMoreTlds ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>

          {showMoreTlds && (
            <div className="extra-chips">
              {['.io', '.co', '.net', '.org', '.dev', '.app', '.in'].map((tld) => {
                const isChecked = selectedTlds.includes(tld);
                const price = TLD_PRICING[tld]?.reg || '';
                return (
                  <button
                    key={tld}
                    type="button"
                    className={`mini-tld-chip ${isChecked ? 'active' : ''}`}
                    onClick={() => toggleTld(tld)}
                  >
                    {tld} ({price})
                  </button>
                );
              })}
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
        <button 
          type="button" 
          className="primary-btn" 
          onClick={onStart}
          disabled={cleanLines.length === 0}
        >
          <Play size={13} fill="currentColor" />
          <span>Check Domains</span>
          <span className="btn-key-hint">⌘↵</span>
        </button>
      ) : (
        <div className="btn-group-running">
          <button 
            type="button" 
            className="btn-secondary flex-1" 
            onClick={onPause}
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button 
            type="button" 
            className="btn-stop" 
            onClick={onStop}
          >
            <Square size={13} fill="currentColor" />
            <span>Stop</span>
          </button>
        </div>
      )}
    </div>
  );
}
