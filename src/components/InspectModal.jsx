import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Terminal } from 'lucide-react';

export default function InspectModal({ record, onClose, onToast }) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!record) return null;

  const jsonContent = record.raw 
    ? JSON.stringify(record.raw, null, 2)
    : record.status === 'available'
      ? `// HTTP 404 Not Found returned by Authoritative RDAP Server.\n// This confirms the domain "${record.domain}" is currently unassigned in the registry.`
      : `// No extended RDAP JSON payload was cached for this query.`;

  const copyJson = () => {
    navigator.clipboard.writeText(jsonContent).then(() => {
      setHasCopied(true);
      onToast("Copied RDAP JSON to clipboard!", "success");
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <motion.div 
      className="modal-overlay open" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-secondary" />
            <h3 className="modal-title">Registry RDAP: {record.domain}</h3>
          </div>
          <motion.button 
            className="modal-close" 
            onClick={onClose} 
            aria-label="Close modal"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>
        </div>

        <div className="modal-body">
          <div className="modal-summary-bar">
            <span><strong>Status:</strong> {record.status.toUpperCase()}</span>
            <span><strong>Checked:</strong> {record.checkedAt}</span>
            <span><strong>Price:</strong> {record.price}</span>
            <motion.button 
              className="btn-copy-json" 
              onClick={copyJson} 
              title="Copy raw JSON payload"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {hasCopied ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
              <span>{hasCopied ? 'Copied' : 'Copy JSON'}</span>
            </motion.button>
          </div>

          <pre className="modal-raw-json">{jsonContent}</pre>
        </div>
      </motion.div>
    </motion.div>
  );
}
