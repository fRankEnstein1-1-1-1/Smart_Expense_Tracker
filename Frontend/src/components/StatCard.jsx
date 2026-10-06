import React from 'react';
import './components.css';

export default function StatCard({
  label,
  value,
  prominent = false,
  className = '',
}) {
  return (
    <div
      className={`stat-card ${prominent ? 'stat-card-prominent' : ''} ${className}`}
    >
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
    </div>
  );
}
