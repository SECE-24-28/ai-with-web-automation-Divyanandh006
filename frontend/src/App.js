import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';

function App() {
  const [modelInfo, setModelInfo] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/model-info`);
      if (response.data.success) {
        setModelInfo(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  const handlePredict = async (imageFile) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error || 'Diagnosis failed. Try another image.');
      }
    } catch (err) {
      console.error('Diagnosis connection error:', err);
      setError(
        err.response?.data?.detail || 
        'Could not connect to the backend server. Please verify that the backend is running at http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌿 Leaf Disease Detection & Diagnosis</h1>
        <p>Identify plant leaf diseases instantly and get organic treatment remedies</p>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            Diagnose Leaf
          </button>
        </div>

        <div className="tab-content">
          <div className="predict-section">
            <PredictionForm
              onSubmit={handlePredict}
              loading={loading}
              modelInfo={modelInfo}
            />

            {error && (
              <div className="error-message">
                <span>❌ Connection Issue: {error}</span>
              </div>
            )}

            {prediction && (
              <PredictionResult prediction={prediction} />
            )}

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>Analyzing crop foliage and cross-referencing disease database...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="App-footer">
        <p>Leaf Disease Classifier v2.21.0 | Backend: FastAPI + TensorFlow | Frontend: React</p>
      </footer>
    </div>
  );
}

export default App;
