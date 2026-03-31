import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/Api';
import "./History.css";

function History() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await API.get('/expense/getexpense');
      setExpenses(response.data);
    } catch (err) {
      setError('Failed to load expense history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="status-container"><h2>⏳ Loading history...</h2></div>;

  if (error) return (
    <div className="status-container">
      <h2>Error</h2>
      <p>{error}</p>
      <button className="btn-primary" onClick={fetchExpenses}>Try Again</button>
    </div>
  );

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>My History</h1>
        <button className="btn-primary" onClick={() => navigate('/home')}>
          + New Scan
        </button>
      </header>

      {expenses.length === 0 ? (
        <div className="empty-history">
          <h3>No expenses found</h3>
          <p>Start by scanning your first bill!</p>
          <button className="btn-primary" onClick={() => navigate('/home')}>
            Scan Now
          </button>
        </div>
      ) : (
        <div className="history-list">
          {expenses.map((expense) => (
            <div key={expense._id} className="expense-card">
              <div className="card-main-info">
                <div>
                  <h3 className="expense-title">{expense.title || "Untitled Bill"}</h3>
                  <span className="expense-date">{formatDate(expense.date)}</span>
                </div>
                <h2 className="expense-amount">
                  ₹{expense.Amount?.toFixed(2) || '0.00'}
                </h2>
              </div>

              <div className="items-preview">
                <span className="items-preview-title">Line Items</span>
                {expense.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className="history-item-row">
                    <span>{item.name || item.item}</span>
                    <span>₹{(item.price || 0).toFixed(2)}</span>
                  </div>
                ))}
                {expense.items?.length > 3 && (
                  <p className="expense-date" style={{marginTop: '8px'}}>
                    + {expense.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="badge-container">
                {expense.category && (
                  <span className="category-badge">{expense.category}</span>
                )}
                {expense.billImage && <span className="expense-date">📸 Image Attached</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;