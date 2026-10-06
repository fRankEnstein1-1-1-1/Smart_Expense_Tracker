/**
 * Utility functions for currency, file sizes, and category colors
 */

export function formatINR(amount) {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const CATEGORY_COLORS = {
  Food: '#34D399',
  Healthcare: '#38BDF8',
  'Personal Care': '#F472B6',
  Clothing: '#A78BFA',
  Household: '#FBBF24',
  Transport: '#60A5FA',
  Entertainment: '#FB7185',
  Utilities: '#2DD4BF',
  Miscellaneous: '#94A3B8',
};

export function getCategoryColor(category) {
  if (!category) return CATEGORY_COLORS.Miscellaneous;
  // Case-insensitive matching
  const match = Object.keys(CATEGORY_COLORS).find(
    (key) => key.toLowerCase() === String(category).toLowerCase()
  );
  return match ? CATEGORY_COLORS[match] : CATEGORY_COLORS.Miscellaneous;
}
