import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../services/Api';
import "./Results.css";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const scanResult = location.state?.scanResult;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // UseMemo to prevent unnecessary recalculations on re-renders
  const { items, grandTotal, categoryTotals, extractedText } = useMemo(() => {
    const rawItems = scanResult?.items || [];
    const text = scanResult?.extractedText || '';
    
    const total = rawItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    const categories = rawItems.reduce((acc, item) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = { total: 0, list: [] };
      const price = parseFloat(item.price) || 0;
      acc[cat].total += price;
      acc[cat].list.push(item);
      return acc;
    }, {});

    return { items: rawItems, grandTotal: total, categoryTotals: categories, extractedText: text };
  }, [scanResult]);

  if (!items.length) {
    return (
      <div className="home-container">
        <h2>No scan data found</h2>
        <button className="btn-nav" onClick={() => navigate('/')}>Go Back Home</button>
      </div>
    );
  }

  const handleSaveExpense = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      await API.post('/expense/trackexpense', {
        items,
        grandTotal,
        extractedText
      });
      setSaveMessage("✅ Expense saved successfully!");
    } catch (error) {
      setSaveMessage("❌ Failed to save expense.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Analysis Results</h1>
        <button className="btn-nav" onClick={() => navigate('/')}>Upload New</button>
      </div>

      <div className="summary-grid">
        <div className="summary-card items">
          <h3>Total Items</h3>
          <h2>{items.length}</h2>
        </div>
        <div className="summary-card total">
          <h3>Grand Total</h3>
          <h2>₹{grandTotal.toFixed(2)}</h2>
        </div>
      </div>

      <div className="category-section">
        <h2>Spending by Category</h2>
        {Object.entries(categoryTotals).map(([category, data]) => (
          <div key={category} className="category-card">
            <div className="category-header">
              <h3>{category}</h3>
              <span className="category-total">₹{data.total.toFixed(2)}</span>
            </div>
            {data.list.map((item, index) => (
              <div key={index} className="line-item">
                <span>{item.item}</span>
                <span>₹{(parseFloat(item.price) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="action-area">
        <button className="btn-save" onClick={handleSaveExpense} disabled={isSaving}>
          {isSaving ? 'Saving...' : '💾 Save This Expense'}
        </button>
        {saveMessage && <div className="save-message">{saveMessage}</div>}
      </div>

      {extractedText && (
        <details className="raw-text-area">
          <summary>View Raw OCR Text</summary>
          <pre>{extractedText}</pre>
        </details>
      )}
    </div>
  );
}

export default Results;