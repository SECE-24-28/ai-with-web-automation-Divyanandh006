# Project Architecture & Documentation

## Overview

This is a complete full-stack machine learning application consisting of:
- **Frontend**: React web interface with modern UI
- **Backend**: FastAPI server with model inference
- **Model**: TensorFlow/Keras neural network

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                           │
│              (React Application - Port 3000)                │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │
┌────────────────────────▼────────────────────────────────────┐
│                FastAPI Backend                              │
│              (Python Server - Port 8000)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Endpoints:                                           │   │
│  │ • GET /health - Health check                         │   │
│  │ • GET /api/model-info - Model information            │   │
│  │ • POST /api/predict - Single prediction              │   │
│  │ • POST /api/predict-batch - Batch predictions        │   │
│  │ • GET /docs - Interactive API documentation          │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Model Handler (model_handler.py)                     │   │
│  │ • Load best_model.h5                                 │   │
│  │ • Make predictions                                   │   │
│  │ • Handle batch operations                            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Machine Learning Model                         │
│                (best_model.h5)                              │
│            TensorFlow/Keras Neural Network                  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with gradients and animations
- **HTML5** - Semantic markup

### Backend
- **FastAPI 0.104** - Modern web framework
- **Uvicorn** - ASGI server
- **TensorFlow 2.14** - Deep learning framework
- **NumPy** - Numerical computations
- **Pydantic** - Data validation

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Production web server

## File Structure Explained

### Backend Structure
```
backend/
├── main.py              # FastAPI application & routes
├── model_handler.py     # Model loading & inference logic
├── config.py            # Configuration management
├── requirements.txt     # Production dependencies
├── requirements-dev.txt # Development dependencies
└── __pycache__/        # Python cache (auto-generated)
```

### Frontend Structure
```
frontend/
├── public/
│   └── index.html       # HTML template
├── src/
│   ├── index.js         # React entry point
│   ├── index.css        # Global styles
│   ├── App.js           # Main App component
│   ├── App.css          # App component styles
│   └── components/
│       ├── PredictionForm.js
│       ├── PredictionForm.css
│       ├── ModelInfo.js
│       ├── ModelInfo.css
│       ├── PredictionResult.js
│       └── PredictionResult.css
├── package.json         # Dependencies & scripts
└── node_modules/        # Dependencies (auto-generated)
```

## Component Descriptions

### Backend Components

#### `main.py`
- FastAPI application setup
- CORS middleware configuration
- Request/response models (Pydantic)
- API endpoints definition
- Model initialization on startup
- Error handling and validation

#### `model_handler.py`
- `ModelHandler` class: Manages ML model lifecycle
- `load_model()`: Loads TensorFlow/Keras model
- `predict()`: Makes predictions on input data
- `get_model_info()`: Returns model metadata

#### `config.py`
- Centralized configuration management
- Environment variable support
- API settings
- CORS settings
- Batch operation settings
- Logging configuration

### Frontend Components

#### `App.js`
- Main React component
- State management (model info, predictions, loading, error)
- Tab navigation between Predict and Model Info
- API integration with axios

#### `PredictionForm.js`
- Dynamic input form based on model input shape
- Input validation
- Random value generation for testing
- Form submission handling

#### `ModelInfo.js`
- Display model metadata
- Show architecture information
- Refresh functionality
- Formatted data presentation

#### `PredictionResult.js`
- Visualization of prediction results
- Top predictions with confidence scores
- Progress bars for classification outputs
- Statistical summary (min/max values)
- Raw output display

## Data Flow

### Single Prediction Flow

```
User Input (React Form)
        ↓
PredictionForm validates input
        ↓
Axios sends POST to /api/predict
        ↓
FastAPI receives request
        ↓
Pydantic validates input data
        ↓
model_handler.predict() called
        ↓
TensorFlow model processes data
        ↓
Returns predictions
        ↓
React receives response
        ↓
PredictionResult displays results
```

### Batch Prediction Flow

```
Batch Data (List of inputs)
        ↓
Axios sends POST to /api/predict-batch
        ↓
FastAPI validates batch
        ↓
NumPy converts to array
        ↓
TensorFlow batch processing
        ↓
Returns batch predictions
        ↓
React displays results
```

## API Request/Response Examples

### Get Model Info

**Request:**
```
GET /api/model-info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "input_shape": [null, 784],
    "output_shape": [null, 10],
    "num_layers": 5,
    "trainable_params": 101386,
    "model_summary": "..."
  }
}
```

### Make Prediction

**Request:**
```
POST /api/predict
Content-Type: application/json

{
  "input_data": [1.0, 2.0, 3.0, ...],
  "description": "Test prediction"
}
```

**Response:**
```json
{
  "success": true,
  "predictions": [[0.05, 0.1, ..., 0.8]],
  "message": "Prediction successful"
}
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend
MODEL_PATH=./best_model.h5
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=30000
```

## Error Handling

### Backend Errors
- 404: Model not found
- 400: Invalid input format
- 500: Server error / Model loading error
- 503: Service unavailable

### Frontend Errors
- Network errors
- CORS errors
- Validation errors
- API connection errors

All errors are caught and displayed to the user.

## Performance Considerations

### Backend Optimization
- Model loaded once at startup
- NumPy for efficient array operations
- Batch processing support
- Async/await for non-blocking operations

### Frontend Optimization
- React Strict Mode for debugging
- CSS animations (hardware accelerated)
- Lazy loading components
- Request debouncing

## Security Considerations

⚠️ **Current Setup is for Development Only**

For production deployment:

1. **CORS**: Restrict `allow_origins` to specific domains
2. **Authentication**: Add JWT/API key authentication
3. **Rate Limiting**: Implement request rate limiting
4. **Input Validation**: Enhance server-side validation
5. **HTTPS**: Use SSL/TLS certificates
6. **Environment**: Store secrets in environment variables

## Testing

### Manual Testing
1. Use `/docs` endpoint for interactive API testing
2. Use examples in `examples/` directory
3. Test with random values
4. Test with extreme values

### Automated Testing (Optional)
```bash
# Install dev dependencies
pip install -r backend/requirements-dev.txt

# Run tests
pytest backend/tests/
```

## Deployment Options

### Local Development
```bash
./start.sh  # macOS/Linux
start.bat   # Windows
```

### Docker
```bash
docker-compose up
```

### Cloud Platforms
- **AWS**: ECS, Lambda, SageMaker
- **GCP**: Cloud Run, App Engine
- **Azure**: App Service, Container Instances
- **Heroku**: Git push deployment

## Monitoring & Logging

### Backend Logging
- Structured logging to console
- Request/response logging
- Model loading status
- Error tracking

### Frontend Logging
- Browser console
- Network tab monitoring
- Error boundaries

## Future Enhancements

- [ ] Authentication & authorization
- [ ] User history & saved predictions
- [ ] Model versioning
- [ ] A/B testing support
- [ ] Advanced analytics
- [ ] WebSocket for real-time updates
- [ ] Mobile app
- [ ] Export predictions to CSV/Excel
- [ ] Batch upload from files

## Troubleshooting Guide

See [README.md](README.md) for detailed troubleshooting steps.

## Quick Commands

```bash
# Setup
make install                # Install all dependencies

# Development
make start                   # Start both servers
make start-backend           # Backend only
make start-frontend          # Frontend only

# Cleanup
make clean                   # Remove all generated files

# Docker
docker-compose up            # Start with Docker
docker-compose down          # Stop containers
```

## References

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [TensorFlow Docs](https://www.tensorflow.org/)
- [Docker Docs](https://docs.docker.com/)

---

**Project Version**: 1.0.0  
**Last Updated**: December 2024
