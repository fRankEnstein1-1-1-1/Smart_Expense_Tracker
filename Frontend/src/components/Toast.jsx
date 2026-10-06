import React, { useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon, XIcon } from './Icons';
import './components.css';

export default function Toast({
  message,
  type = 'success', // success | error
  onClose,
  duration = 4000,
}) {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast toast-${type}`}>
        {type === 'success' ? (
          <CheckIcon size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        ) : (
          <AlertTriangleIcon size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
        )}
        <span style={{ flex: 1 }}>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="alert-close"
            aria-label="Close notification"
          >
            <XIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
