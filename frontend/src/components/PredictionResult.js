import React, { useState } from 'react';
import './PredictionResult.css';

function PredictionResult({ prediction }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!prediction || !prediction.success) return null;

  const { diagnosis, predictions } = prediction;
  const primaryPrediction = predictions[0];
  
  const confidencePercent = (primaryPrediction.confidence * 100).toFixed(1);
  const isHealthy = diagnosis.is_healthy;
  
  return (
    <div className="prediction-result">
      {/* Diagnosis Header Card */}
      <div className={`diagnosis-card ${isHealthy ? 'healthy' : 'infected'}`}>
        <div className="diagnosis-status">
          <span className="status-badge">{isHealthy ? '✓ HEALTHY FOLIAGE' : '⚠ PATHOGEN DETECTED'}</span>
          <h2>{diagnosis.plant}</h2>
          <h3 className="disease-name">{isHealthy ? 'Healthy Leaf' : diagnosis.disease}</h3>
          <p className="confidence-label">AI Diagnosis Confidence: <strong>{confidencePercent}%</strong></p>
        </div>
        <div className="diagnosis-icon-large">
          {isHealthy ? '🌿' : '🍂'}
        </div>
      </div>

      {/* Remedies & Treatment Database Card */}
      <div className="treatment-card">
        <div className="card-section">
          <h3>📋 Foliage Description</h3>
          <p className="section-text">{diagnosis.description}</p>
        </div>

        <div className="card-section">
          <h3>⚡ Potential Causes</h3>
          <p className="section-text">{diagnosis.causes}</p>
        </div>

        <div className="card-section">
          <h3>🌱 Recommended Remedies & Action Plan</h3>
          <ul className="remedy-list">
            {diagnosis.remedies.map((remedy, idx) => (
              <li key={idx} className="remedy-item">
                <span className="remedy-bullet">☘</span>
                <span className="remedy-text">{remedy}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confidence Match Chart */}
      <div className="match-chart-card">
        <h3>🔬 Top Matching Diagnoses</h3>
        <div className="predictions-list">
          {predictions.map((pred, idx) => {
            const pct = (pred.confidence * 100).toFixed(1);
            return (
              <div key={idx} className="prediction-item">
                <div className="prediction-info">
                  <span className="prediction-label">{pred.label}</span>
                  <span className="prediction-value">{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill animate-width"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: idx === 0 
                        ? (isHealthy ? '#2e7d32' : '#d84315') 
                        : '#78909c'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Toggle */}
      <div className="advanced-toggle-area">
        <button 
          type="button" 
          className="btn-toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Technical Metadata' : 'Show Technical Metadata'}
        </button>
        {showAdvanced && (
          <div className="raw-result">
            <h3>Raw API Classification Payload</h3>
            <pre className="result-code">
              {JSON.stringify(prediction, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionResult;
