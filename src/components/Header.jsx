import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Copy, CheckCircle2 } from 'lucide-react';

export default function Header({ availableCount, onCopyAvailable, hasCopied }) {
  return (
    <motion.header 
      className="app-header"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="brand">
        <motion.div 
          className="logo-badge" 
          title="DomainScope Engine"
          whileHover={{ rotate: 12, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Globe size={18} strokeWidth={2.2} />
        </motion.div>
        <div className="brand-content">
          <h1>DomainScope</h1>
        </div>
      </div>

      <div className="header-actions">
        <div className="system-status" title="Google DoH + Direct Registry RDAP">
          <span className="status-dot-live"></span>
          <span>RDAP Active</span>
        </div>

        <motion.button 
          onClick={onCopyAvailable} 
          className="btn-secondary" 
          disabled={availableCount === 0}
          title={availableCount > 0 ? `Copy ${availableCount} available domains` : "No available domains"}
          whileHover={availableCount > 0 ? { scale: 1.02 } : {}}
          whileTap={availableCount > 0 ? { scale: 0.97 } : {}}
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
        </motion.button>
      </div>
    </motion.header>
  );
}
