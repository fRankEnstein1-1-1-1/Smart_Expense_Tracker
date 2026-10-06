import React from 'react';
import './components.css';

export default function Card({
  children,
  elevated = false,
  interactive = false,
  className = '',
  onClick,
  ...rest
}) {
  const classes = [
    'card',
    elevated ? 'card-elevated' : '',
    interactive ? 'card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}
