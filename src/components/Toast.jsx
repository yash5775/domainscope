import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
          {toast.type === 'success' && <CheckCircle2 size={14} className="text-emerald" />}
          {toast.type === 'error' && <AlertCircle size={14} className="text-rose" />}
          {(!toast.type || toast.type === 'info') && <Info size={14} className="text-blue" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
