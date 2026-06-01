import React, { useState, useRef } from 'react';
import './PredictionForm.css';

function PredictionForm({ onSubmit, loading, modelInfo }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onSubmit(selectedFile);
    }
  };

  const clearForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="prediction-form">
      <h2>Scan Plant Foliage</h2>
      <p className="form-subtitle">Upload a photo of a single leaf to run real-time AI disease analysis.</p>
      
      <form onSubmit={handleFormSubmit}>
        <div 
          className={`upload-zone ${isDragActive ? 'active' : ''} ${previewUrl ? 'has-preview' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!previewUrl ? triggerFileSelect : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden-input"
            disabled={loading}
          />
          
          {previewUrl ? (
            <div className="preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={previewUrl} alt="Leaf Preview" className="image-preview" />
              <button 
                type="button" 
                className="btn-clear" 
                onClick={clearForm}
                disabled={loading}
              >
                ✕ Change Image
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📸</div>
              <p className="upload-text-main">Drag and drop your leaf photo here</p>
              <p className="upload-text-sub">or click to browse directories</p>
              <span className="upload-hint">Supports JPEG, PNG, JPG up to 10MB</span>
            </div>
          )}
        </div>

        <div className="tip-box">
          <h4>💡 For High-Accuracy Diagnosis:</h4>
          <ul>
            <li>Place a single leaf flat on a solid light-colored background.</li>
            <li>Avoid blurry pictures; ensure your camera is in sharp focus.</li>
            <li>Avoid shadows and excessive glares across the leaf surface.</li>
          </ul>
        </div>

        <div className="button-group">
          {previewUrl && (
            <button
              type="button"
              onClick={clearForm}
              className="btn btn-secondary"
              disabled={loading}
            >
              Reset
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={!selectedFile || loading}
          >
            {loading ? 'Diagnosing Crop...' : '🔬 Run AI Diagnosis'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PredictionForm;
