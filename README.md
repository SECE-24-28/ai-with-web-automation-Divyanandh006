# ML Model Prediction Interface

A complete full-stack machine learning application with a React frontend and FastAPI backend. This project allows you to load a TensorFlow/Keras model and make real-time predictions through an interactive web interface.

## Features

✨ **Frontend (React)**
- Modern, responsive UI with gradient design
- Real-time prediction interface
- Interactive model information dashboard
- Support for multiple input features
- Random value generation for testing
- Beautiful visualizations of predictions

🔧 **Backend (FastAPI)**
- RESTful API endpoints for predictions
- Batch prediction support
- Model information retrieval
- CORS enabled for cross-origin requests
- Interactive API documentation (Swagger UI)
- Automatic model loading on startup

🤖 **Model Support**
- TensorFlow/Keras models (.h5 format)
- Support for any neural network architecture
- Automatic input shape detection
- Batch prediction capabilities

## Project Structure

```
model_frontend_building/
├── best_model.h5              # Your trained ML model
├── backend/
│   ├── main.py               # FastAPI application
│   ├── model_handler.py       # Model loading and inference
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # App styling
│   │   ├── index.js          # React entry point
│   │   ├── index.css         # Global styles
│   │   └── components/
│   │       ├── PredictionForm.js      # Prediction input form
│   │       ├── PredictionForm.css     # Form styling
│   │       ├── ModelInfo.js           # Model details display
│   │       ├── ModelInfo.css          # Info styling
│   │       ├── PredictionResult.js    # Result visualization
│   │       └── PredictionResult.css   # Result styling
│   ├── package.json          # Frontend dependencies
│   └── .gitignore
├── README.md                 # This file
└── .gitignore               # Git ignore patterns
```

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 14+** (for frontend)
- **npm or yarn** (package manager)
- **TensorFlow/Keras** model (.h5 file)

## Installation & Setup

### 1. Backend Setup

#### Step 1.1: Navigate to backend directory
```bash
cd backend
```

#### Step 1.2: Create virtual environment (recommended)
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Step 1.3: Install dependencies
```bash
pip install -r requirements.txt
```

#### Step 1.4: Verify model placement
Ensure `best_model.h5` is in the root directory of the project.

### 2. Frontend Setup

#### Step 2.1: Navigate to frontend directory
```bash
cd frontend
```

#### Step 2.2: Install dependencies
```bash
npm install
```

## Running the Application

### Starting the Backend

```bash
cd backend
python main.py
```

The backend will start on `http://localhost:8000`

**Useful endpoints:**
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Starting the Frontend

In a **new terminal**:

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Using the Application

### Making Predictions

1. **Navigate to the Predict tab** (default on startup)
2. **Enter input features:**
   - Manually enter values for each input feature
   - OR click "Random Values" to generate test data
3. **Click "Get Prediction"** to submit to the model
4. **View results:**
   - Top predictions with confidence scores
   - Raw output data
   - Statistical information (min/max values)

### Viewing Model Information

1. **Click the "Model Info" tab**
2. **View model details:**
   - Input and output shapes
   - Number of layers
   - Total trainable parameters
   - Full model architecture

## API Documentation

### Endpoints

#### GET `/health`
Health check endpoint

```bash
curl http://localhost:8000/health
```

#### GET `/api/model-info`
Retrieve model information

```bash
curl http://localhost:8000/api/model-info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "input_shape": [null, 28, 28, 1],
    "output_shape": [null, 10],
    "num_layers": 5,
    "trainable_params": 128750
  }
}
```

#### POST `/api/predict`
Make a single prediction

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "input_data": [1.0, 2.0, 3.0, 4.0, 5.0],
    "description": "Test prediction"
  }'
```

**Response:**
```json
{
  "success": true,
  "predictions": [[0.1, 0.9, 0.0, ...]],
  "message": "Prediction successful"
}
```

#### POST `/api/predict-batch`
Make batch predictions

```bash
curl -X POST http://localhost:8000/api/predict-batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch_data": [
      [1.0, 2.0, 3.0],
      [4.0, 5.0, 6.0],
      [7.0, 8.0, 9.0]
    ]
  }'
```

## Configuration

### Backend Configuration

Edit `backend/main.py` to customize:

- **Port:** Change `port=8000` in the `if __name__ == "__main__"` block
- **Model path:** Modify `model_path` in `startup_event()`
- **CORS origins:** Update `allow_origins` in the CORS middleware

### Frontend Configuration

Edit `frontend/package.json`:

- **Backend URL:** Change `"proxy"` value if backend runs on a different port/URL
- **Port:** Modify `start` script if needed

## Troubleshooting

### Backend Issues

**Model not found error:**
```
✗ Error loading model: [Errno 2] No such file or directory: 'best_model.h5'
```
- Ensure `best_model.h5` is in the root project directory
- Check file path in `backend/main.py`

**Port already in use:**
```
OSError: [Errno 48] Address already in use
```
- Change port in `main.py` or kill process using port 8000

**TensorFlow import error:**
```
ModuleNotFoundError: No module named 'tensorflow'
```
- Reinstall dependencies: `pip install -r requirements.txt`
- Consider using a fresh virtual environment

### Frontend Issues

**Cannot connect to backend:**
- Ensure backend is running on `http://localhost:8000`
- Check browser console for CORS errors
- Verify `proxy` setting in `package.json`

**Dependencies not installing:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```
- Clear cache: `npm cache clean --force`
- Delete `node_modules`: `rm -rf node_modules`
- Reinstall: `npm install`

## Performance Optimization

### Backend

1. **Disable verbose output:** Change `verbose=0` to `verbose=1` in model predictions
2. **Use GPU:** Ensure TensorFlow GPU drivers are installed
3. **Batch predictions:** Use `/api/predict-batch` for multiple predictions

### Frontend

1. **Build for production:** `npm run build`
2. **Serve static files** using Nginx or similar
3. **Enable caching** headers in backend

## Model Requirements

### Supported Models
- TensorFlow/Keras models (.h5 format)
- Any architecture (CNN, RNN, Dense, etc.)
- Classification, regression, or custom outputs

### Model Preparation

Ensure your model:
1. Is saved in `.h5` format: `model.save('best_model.h5')`
2. Can make predictions: `model.predict(numpy_array)`
3. Has defined input/output shapes

### Example: Training and Saving

```python
import tensorflow as tf
from tensorflow.keras import layers

# Build model
model = tf.keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(28*28*1,)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(10, activation='softmax')
])

# Compile and train
model.compile(optimizer='adam', loss='categorical_crossentropy')
model.fit(x_train, y_train, epochs=5)

# Save model
model.save('best_model.h5')
```

## Deployment

### Docker (Optional)

#### Backend Dockerfile
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
COPY best_model.h5 .
CMD ["python", "main.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Cloud Deployment

**AWS, GCP, or Azure:**
1. Push Docker images to container registry
2. Deploy backend as serverless function or container
3. Deploy frontend to static hosting (S3, Cloud Storage, etc.)
4. Configure API endpoint in frontend

## Contributing

Feel free to fork and submit pull requests!

## License

MIT License - feel free to use this project for educational and commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check backend console logs
4. Open an issue in the repository

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TensorFlow/Keras Guide](https://www.tensorflow.org/guide)
- [Axios Documentation](https://axios-http.com/)

---

Happy predicting! 🚀
