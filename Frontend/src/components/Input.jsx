import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';
import './components.css';

export default function Input({
  label,
  type = 'text',
  error,
  id,
  className = '',
  rightAdornment,
  allowTogglePassword = false,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const actualType = allowTogglePassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input
          id={id}
          type={actualType}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...rest}
        />
        {allowTogglePassword && (
          <button
            type="button"
            className="input-adornment-right"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        )}
        {!allowTogglePassword && rightAdornment && (
          <div className="input-adornment-right">{rightAdornment}</div>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
