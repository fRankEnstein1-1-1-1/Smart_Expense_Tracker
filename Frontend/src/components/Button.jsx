import React from 'react';
import './components.css';

export default function Button({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md',        // sm | md | lg
  block = false,
  loading = false,
  disabled = false,
  className = '',
  icon = null,
  onClick,
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon}
      <span>{children}</span>
    </button>
  );
}
