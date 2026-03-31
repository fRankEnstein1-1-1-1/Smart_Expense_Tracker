import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/Api';
import "./Home.css";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
  // Add here to get the actual file object
  const file = e.target.files[0]; 
  
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  // Now file.type will correctly return "image/png", etc.
  if (!allowedTypes.includes(file.type)) {
    setError('Please upload a valid image (JPG, PNG, or WebP)');
    setSelectedFile(null); // Clear selection on error
    setPreview(null);
    return;
  }

  setSelectedFile(file);
  setError('');

  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result);
  reader.readAsDataURL(file);
};

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('bill', selectedFile);

    try {
      const response = await API.post('/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/results', { state: { scanResult: response.data } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to process the bill.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Smart Expense Tracker</h1>
        <p className="home-subtitle">Upload a bill to categorize expenses automatically</p>
      </header>

      <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {preview ? (
          <div>
            <img src={preview} alt="Preview" className="preview-img" />
            <p><strong>File:</strong> {selectedFile.name}</p>
          </div>
        ) : (
          <div>
            <span className="upload-icon">📸</span>
            <h3>Click to Upload Bill</h3>
            <p>Supports JPG, PNG, WebP</p>
          </div>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="button-group">
        <button 
          className="btn-primary" 
          onClick={handleUpload} 
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process Bill'}
        </button>

        <button 
          className="btn-secondary" 
          onClick={() => navigate('/history')}
        >
          View History
        </button>
      </div>
    </div>
  );
}

export default Home;