import React from 'react';
import { Globe, Copy, CheckCircle2 } from 'lucide-react';

export default function Header({ availableCount, onCopyAvailable, hasCopied }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="logo-badge" title="DomainScope Engine">
          <Globe size={18} strokeWidth={2.2} />
        </div>
        <div className="brand-content">
          <h1>DomainScope</h1>
        </div>
      </div>

      <div className="header-actions">
        <div className="system-status" title="Google DoH + Direct Registry RDAP">
          <span className="status-dot-live"></span>
          <span>RDAP Active</span>
        </div>

        <button 
          onClick={onCopyAvailable} 
          className="btn-secondary" 
          disabled={availableCount === 0}
          title={availableCount > 0 ? `Copy ${availableCount} available domains` : "No available domains"}
        >
          {hasCopied ? (
            <>
              <CheckCircle2 size={13} className="text-emerald" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy Available ({availableCount})</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
