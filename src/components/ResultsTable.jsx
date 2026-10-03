import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  ExternalLink, 
  Code2, 
  Copy, 
  Check, 
  X,
  Compass
} from 'lucide-react';

export default function ResultsTable({
  results,
  isRunning,
  progress,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  onExportCsv,
  onExportPdf,
  onInspect,
  onToast
}) {
  const [copiedDomain, setCopiedDomain] = useState(null);

  const handleCopy = (domain) => {
    navigator.clipboard.writeText(domain).then(() => {
      setCopiedDomain(domain);
      onToast(`Copied ${domain}!`, 'success');
      setTimeout(() => setCopiedDomain(null), 1800);
    }).catch(() => {
      onToast("Failed to copy", 'error');
    });
  };

  // Filter and search records
  const filteredRecords = results.filter((record) => {
    const matchesFilter = activeFilter === 'all' || record.status === activeFilter;
    const matchesSearch = !searchQuery || record.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCount = results.length;
  const availableCount = results.filter(r => r.status === 'available').length;
  const takenCount = results.filter(r => r.status === 'taken').length;

  return (
    <div className="results-container">
      {/* Live Progress Bar */}
      {isRunning && (
        <div className="progress-container active">
          <div className="progress-header">
            <span className="progress-label">
              <span className="pulse-dot"></span>
              <span>{progress.currentDomain || 'Checking domains...'}</span>
            </span>
            <span className="progress-percentage">{progress.percent}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${progress.percent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Toolbar: Filter Tabs, Instant Search & Exports */}
      <div className="results-toolbar">
        <div className="toolbar-left">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All <span className="filter-count">{totalCount}</span>
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'available' ? 'active' : ''}`}
              onClick={() => setActiveFilter('available')}
            >
              Available <span className="filter-count">{availableCount}</span>
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'taken' ? 'active' : ''}`}
              onClick={() => setActiveFilter('taken')}
            >
              Registered <span className="filter-count">{takenCount}</span>
            </button>
          </div>

          {/* Instant Search Filter */}
          <div className="search-input-wrapper">
            <Search size={13} className="search-icon" />
            <input
              type="text"
              className="table-search-input"
              placeholder="Search results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Export Suite */}
        <div className="export-actions">
          <button
            type="button"
            className="btn-export btn-export-csv"
            disabled={results.length === 0}
            onClick={onExportCsv}
            title="Export CSV"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            className="btn-export btn-export-pdf"
            disabled={results.length === 0}
            onClick={onExportPdf}
            title="Export PDF"
          >
            <FileText size={12} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="domain-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>Domain</th>
              <th style={{ width: '18%' }}>Status</th>
              <th style={{ width: '22%' }}>Price</th>
              <th style={{ width: '22%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => {
                const dotIndex = record.domain.lastIndexOf('.');
                const domainNamePart = record.domain.substring(0, dotIndex);
                const domainTldPart = record.domain.substring(dotIndex);
                const isCopied = copiedDomain === record.domain;

                return (
                  <tr key={record.domain}>
                    {/* Domain Cell */}
                    <td>
                      <div className="domain-cell">
                        <span>
                          <span className="domain-name-highlight">{domainNamePart}</span>
                          <span className="domain-tld-highlight">{domainTldPart}</span>
                        </span>
                        
                        <button
                          type="button"
                          className="btn-row-copy"
                          onClick={() => handleCopy(record.domain)}
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check size={12} className="text-emerald" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Cell */}
                    <td>
                      {record.status === 'available' ? (
                        <span className="status-badge status-available">
                          <span className="status-dot"></span>
                          Available
                        </span>
                      ) : record.status === 'taken' ? (
                        <span className="status-badge status-taken">
                          <span className="status-dot"></span>
                          Registered
                        </span>
                      ) : (
                        <span className="status-badge status-error">
                          <span className="status-dot"></span>
                          Rate Limited
                        </span>
                      )}
                    </td>

                    {/* Price Cell */}
                    <td>
                      {record.status === 'available' ? (
                        <div className="price-badge">
                          <span className="price-value">{record.price}</span>
                          <span className="price-note">{record.termNote}</span>
                        </div>
                      ) : record.status === 'taken' ? (
                        <span className="text-tertiary text-xs">—</span>
                      ) : (
                        <span className="text-warn text-xs">—</span>
                      )}
                    </td>

                    {/* Action Cell */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-links">
                        {record.status === 'available' && (
                          <a
                            href={record.buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-buy"
                            title="Register domain"
                          >
                            <span>Register</span>
                            <ExternalLink size={10} strokeWidth={2.5} />
                          </a>
                        )}

                        <button
                          type="button"
                          className="btn-inspect"
                          onClick={() => onInspect(record)}
                          title="View RDAP response"
                        >
                          <Code2 size={11} />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="empty-state">
                    <Compass size={32} className="empty-icon" strokeWidth={1.5} />
                    <h3>{results.length === 0 ? "No Domains Checked" : "No Matches"}</h3>
                    <p>
                      {results.length === 0
                        ? "Enter names or domains on the left to check availability."
                        : `No checked domains matched "${searchQuery}".`}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
