import React from 'react';
import { AlertTriangleIcon, XIcon } from './Icons';
import './components.css';

export default function Alert({
  variant = 'warning', // warning | error | success
  children,
  onClose,
  className = '',
}) {
  return (
    <div className={`alert-banner alert-${variant} ${className}`} role="alert">
      <AlertTriangleIcon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div className="alert-content">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close"
          aria-label="Dismiss alert"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
}
