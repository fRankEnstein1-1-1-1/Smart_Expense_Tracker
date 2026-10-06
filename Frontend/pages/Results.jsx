import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/Api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../src/components/StatCard';
import Button from '../src/components/Button';
import Badge from '../src/components/Badge';
import Alert from '../src/components/Alert';
import Toast from '../src/components/Toast';
import EmptyState from '../src/components/EmptyState';
import { ChevronDownIcon, UploadIcon, ReceiptIcon } from '../src/components/Icons';
import { formatINR, getCategoryColor } from '../src/utils/format';
import './Results.css';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const scanResult = location.state?.scanResult;
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [dismissWarning, setDismissWarning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // UseMemo to compute derived values
  const {
    items,
    grandTotal,
    categoryTotals,
    extractedText,
    itemSum,
    subTotal,
    hasSubTotalMismatch,
    apiWarning,
  } = useMemo(() => {
    const rawItems = scanResult?.items || [];
    const text = scanResult?.extractedText || '';
    const warningText = scanResult?.warning || null;

    const sum = rawItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    const parsedGrandTotal = scanResult?.grandTotal != null ? parseFloat(scanResult.grandTotal) : null;
    const total = parsedGrandTotal ?? sum;
    const parsedSubTotal = scanResult?.subTotal != null ? parseFloat(scanResult.subTotal) : null;
    const mismatch = parsedSubTotal != null && Math.abs(parsedSubTotal - sum) > 1;

    const categories = rawItems.reduce((acc, item) => {
      const cat = item.category || 'Miscellaneous';
      if (!acc[cat]) acc[cat] = { total: 0, list: [] };
      const price = parseFloat(item.price) || 0;
      acc[cat].total += price;
      acc[cat].list.push(item);
      return acc;
    }, {});

    return {
      items: rawItems,
      grandTotal: total,
      categoryTotals: categories,
      extractedText: text,
      itemSum: sum,
      subTotal: parsedSubTotal,
      hasSubTotalMismatch: mismatch,
      apiWarning: warningText,
    };
  }, [scanResult]);

  // Sort categories by total descending
  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals).sort(([, a], [, b]) => b.total - a.total);
  }, [categoryTotals]);

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  if (!items.length) {
    return (
      <div className="results-wrapper">
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="No scan data found"
          description="We couldn't find any bill data to display. Please upload or scan a shopping bill to see itemized spending."
          action={
            <Button
              variant="primary"
              icon={<UploadIcon size={16} />}
              onClick={() => navigate('/home')}
            >
              Upload Bill
            </Button>
          }
        />
      </div>
    );
  }

  const handleSaveExpense = async () => {
    setIsSaving(true);

    try {
      await API.post('/expense/trackexpense', {
        items,
        grandTotal,
        extractedText,
      });
      setToast({
        message: 'Expense saved to history successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: error.response?.data?.message || 'Failed to save expense. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const warningMessage =
    apiWarning ||
    (hasSubTotalMismatch
      ? `Bill subtotal (${formatINR(subTotal)}) differs from the sum of detected items (${formatINR(itemSum)}) by more than ₹1.00.`
      : null);

  const totalForPercentages = grandTotal > 0 ? grandTotal : 1;

  return (
    <div className="results-wrapper">
      {/* Top Header */}
      <div className="results-top-bar">
        <div>
          <h1 className="page-title">Analysis Results</h1>
          <p className="page-subtitle">Review extracted items and category breakdown</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<UploadIcon size={16} />}
          onClick={() => navigate('/home')}
        >
          Scan Another Bill
        </Button>
      </div>

      {/* Dismissible Warning Banner */}
      {warningMessage && !dismissWarning && (
        <Alert variant="warning" onClose={() => setDismissWarning(true)}>
          {warningMessage}
        </Alert>
      )}

      {/* 3 Summary Stat Cards */}
      <div className="results-stats-grid">
        <StatCard
          label="Total Items"
          value={items.length}
        />
        <StatCard
          label="Grand Total"
          value={formatINR(grandTotal)}
          prominent
        />
        <StatCard
          label="Categories Found"
          value={sortedCategories.length}
        />
      </div>

      {/* Spending by Category Section */}
      <div className="section-header">
        <h2 className="section-title">Spending by Category</h2>
        <p className="section-subtitle">Visual distribution and detailed itemization</p>
      </div>

      {/* Stacked Category Progress Bar */}
      <div className="category-breakdown-card">
        <div className="stacked-bar-container" role="progressbar" aria-label="Category share of total spending">
          {sortedCategories.map(([category, data]) => {
            const percentage = Math.max(0, (data.total / totalForPercentages) * 100);
            return (
              <div
                key={category}
                className="stacked-bar-segment"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: getCategoryColor(category),
                }}
                title={`${category}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="stacked-bar-legend">
          {sortedCategories.map(([category, data]) => {
            const percentage = ((data.total / totalForPercentages) * 100).toFixed(1);
            return (
              <div key={category} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span>{category}</span>
                <span className="legend-percentage tabular-nums">({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Category Cards */}
      <div className="category-cards-list">
        {sortedCategories.map(([category, data]) => {
          const isExpanded = !!expandedCategories[category];
          const percentage = Math.min(100, Math.max(0, (data.total / totalForPercentages) * 100));

          return (
            <div key={category} className="cat-accordion-card">
              <button
                type="button"
                className="cat-accordion-header"
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
              >
                <div className="cat-header-left">
                  <Badge category={category}>{category}</Badge>
                  <div className="cat-name-group">
                    <span className="cat-count">
                      {data.list.length} {data.list.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                <div className="cat-header-right">
                  <span className="cat-total">{formatINR(data.total)}</span>
                  <span className={`cat-chevron ${isExpanded ? 'open' : ''}`}>
                    <ChevronDownIcon size={18} />
                  </span>
                </div>
              </button>

              {/* Progress bar line */}
              <div className="cat-progress-bar">
                <div
                  className="cat-progress-fill"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: getCategoryColor(category),
                  }}
                />
              </div>

              {/* Line items accordion */}
              {isExpanded && (
                <div className="cat-items-list">
                  {data.list.map((item, index) => (
                    <div key={index} className="cat-item-row">
                      <span className="cat-item-name">{item.item}</span>
                      <span className="cat-item-price">
                        {formatINR(parseFloat(item.price) || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky Action Card */}
      <div className="results-actions-card">
        <div className="actions-hints">
          {!isAuthenticated ? (
            <span>Sign in to save this expense to your history</span>
          ) : (
            <span>Ready to save this categorized expense to your history</span>
          )}
        </div>
        <div className="actions-buttons-row">
          <Button
            variant="secondary"
            onClick={() => navigate('/home')}
          >
            Scan Another
          </Button>

          <Button
            variant="primary"
            onClick={handleSaveExpense}
            disabled={isSaving || !isAuthenticated}
            loading={isSaving}
            title={!isAuthenticated ? 'Please log in to save expense' : 'Save Expense'}
          >
            {isSaving ? 'Saving…' : 'Save Expense'}
          </Button>
        </div>
      </div>

      {/* Raw OCR Text Collapsible */}
      {extractedText && (
        <details className="ocr-details">
          <summary>View Raw OCR Text</summary>
          <pre>{extractedText}</pre>
        </details>
      )}

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default Results;