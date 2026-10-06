import React from 'react';
import './components.css';

export default function Badge({ category, children, className = '' }) {
  // Normalize category class name
  const catSlug = (category || children || 'misc')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');

  const knownSlugs = [
    'food',
    'healthcare',
    'personal-care',
    'clothing',
    'household',
    'transport',
    'entertainment',
    'utilities',
    'misc',
    'miscellaneous',
  ];

  const matchedSlug = knownSlugs.includes(catSlug)
    ? catSlug === 'miscellaneous'
      ? 'misc'
      : catSlug
    : 'misc';

  return (
    <span className={`badge badge-cat-${matchedSlug} ${className}`}>
      <span className="badge-dot" />
      <span>{children || category}</span>
    </span>
  );
}
