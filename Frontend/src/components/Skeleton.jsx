import React from 'react';
import './components.css';

export default function Skeleton({
  variant = 'card', // card | text | custom
  width,
  height,
  className = '',
  style = {},
}) {
  const customStyle = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={customStyle}
    />
  );
}
