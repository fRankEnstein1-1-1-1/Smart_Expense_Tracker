import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/Api';
import { UploadIcon, TrashIcon, SparklesIcon, HistoryIcon } from '../src/components/Icons';
import Button from '../src/components/Button';
import Alert from '../src/components/Alert';
import { formatBytes } from '../src/utils/format';
import './Home.css';

const SCAN_MESSAGES = [
  'Reading bill…',
  'Extracting items & prices…',
  'Categorizing spending…',
  'Finalizing analysis…',
];

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Rotate status message while scanning
  useEffect(() => {
    if (!isProcessing) {
      setStatusMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const processFile = (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG, or WebP)');
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      setError(err.response?.data?.error || 'Failed to process the bill.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="home-wrapper">
      <header className="home-header-center">
        <h1 className="page-title">Smart Expense Tracker</h1>
        <p className="page-subtitle">Upload a bill to categorize expenses automatically</p>
      </header>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Dropzone or File Preview */}
      {!preview && !isProcessing && (
        <div
          className={`dropzone-card ${isDragging ? 'dropzone-active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload shopping bill image"
        >
          <input
            type="file"
            ref={fileInputRef}
            id="fileInput"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div className="dropzone-icon-wrap">
            <UploadIcon size={24} />
          </div>
          <h2 className="dropzone-title">Drag &amp; drop your bill or click to browse</h2>
          <p className="dropzone-hint">Supports JPG, PNG or WEBP</p>
        </div>
      )}

      {/* Selected File Preview */}
      {preview && !isProcessing && (
        <div className="preview-card">
          <div className="preview-media-box">
            <img src={preview} alt="Selected bill preview" className="preview-image" />
          </div>
          <div className="preview-meta">
            <div className="preview-file-info">
              <span className="preview-file-name">{selectedFile?.name}</span>
              <span className="preview-file-size">
                {selectedFile ? formatBytes(selectedFile.size) : ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<TrashIcon size={14} />}
              onClick={handleRemoveFile}
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Scanning Active State */}
      {isProcessing && (
        <div className="scan-progress-box">
          <div className="scan-spinner-ring" />
          <h2 className="scan-status-text">{SCAN_MESSAGES[statusMessageIndex]}</h2>
          <p className="scan-subtext">
            Analyzing your receipt with OCR and ML categorization. The first scan may take up to 30 seconds if the backend server is waking up.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="home-actions">
        <Button
          variant="primary"
          size="lg"
          icon={<SparklesIcon size={18} />}
          onClick={handleUpload}
          disabled={!selectedFile || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Processing Bill...' : 'Analyze Bill'}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          icon={<HistoryIcon size={18} />}
          onClick={() => navigate('/history')}
          disabled={isProcessing}
        >
          View History
        </Button>
      </div>
    </div>
  );
}

export default Home;