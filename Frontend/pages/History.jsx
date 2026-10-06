import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/Api';
import Button from '../src/components/Button';
import Badge from '../src/components/Badge';
import Skeleton from '../src/components/Skeleton';
import EmptyState from '../src/components/EmptyState';
import Alert from '../src/components/Alert';
import { ChevronDownIcon, UploadIcon, HistoryIcon, ReceiptIcon } from '../src/components/Icons';
import { formatINR } from '../src/utils/format';
import './History.css';

function History() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/expense/getexpense');
      // Sort newest first
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
      );
      setExpenses(sorted);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expense history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="history-wrapper">
      <div className="history-header-row">
        <div>
          <h1 className="page-title">Expense History</h1>
          <p className="page-subtitle">Track and review your past scanned bills</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<UploadIcon size={16} />}
          onClick={() => navigate('/home')}
        >
          New Scan
        </Button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="history-list">
          <Skeleton variant="card" height="96px" />
          <Skeleton variant="card" height="96px" />
          <Skeleton variant="card" height="96px" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert variant="error">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={fetchExpenses}>
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && expenses.length === 0 && (
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="No expenses found"
          description="You haven't saved any bill expenses yet. Scan your first receipt to start tracking!"
          action={
            <Button
              variant="primary"
              icon={<UploadIcon size={16} />}
              onClick={() => navigate('/home')}
            >
              Scan Your First Bill
            </Button>
          }
        />
      )}

      {/* Expenses List */}
      {!loading && !error && expenses.length > 0 && (
        <div className="history-list">
          {expenses.map((expense) => {
            const isExpanded = expandedId === expense._id;
            const itemsCount = expense.items?.length || 0;
            const amountVal = expense.Amount || 0;

            // Extract unique categories present in line items
            const distinctCategories = Array.from(
              new Set(
                (expense.items || [])
                  .map((i) => i.category)
                  .filter(Boolean)
              )
            );
            if (distinctCategories.length === 0 && expense.category) {
              distinctCategories.push(expense.category);
            }

            return (
              <div key={expense._id} className="history-card">
                <button
                  type="button"
                  className="history-card-header-btn"
                  onClick={() => toggleExpand(expense._id)}
                  aria-expanded={isExpanded}
                >
                  <div className="history-primary-info">
                    <span className="history-bill-title">
                      {expense.title || 'Shopping Receipt'}
                    </span>
                    <div className="history-meta-sub">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span>{itemsCount} {itemsCount === 1 ? 'item' : 'items'}</span>
                    </div>
                    {distinctCategories.length > 0 && (
                      <div className="history-pills-row">
                        {distinctCategories.slice(0, 4).map((cat) => (
                          <Badge key={cat} category={cat}>
                            {cat}
                          </Badge>
                        ))}
                        {distinctCategories.length > 4 && (
                          <span className="history-meta-sub">
                            +{distinctCategories.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="history-secondary-info">
                    <span className="history-amount">{formatINR(amountVal)}</span>
                    <span className={`history-chevron ${isExpanded ? 'open' : ''}`}>
                      <ChevronDownIcon size={18} />
                    </span>
                  </div>
                </button>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="history-expanded-content">
                    <div className="history-items-header">Itemized Breakdown</div>
                    <div className="history-items-grid">
                      {(expense.items || []).map((item, idx) => (
                        <div key={idx} className="history-item-line">
                          <div className="history-item-left">
                            <span>{item.name || item.item}</span>
                            {item.category && (
                              <Badge category={item.category} className="btn-sm">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          <span className="history-item-price">
                            {formatINR(parseFloat(item.price) || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;