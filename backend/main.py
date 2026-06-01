"""
FastAPI Backend for ML Model
Serves predictions and model information
"""
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import os
from model_handler import initialize_model, get_model_handler

# Initialize FastAPI app
app = FastAPI(
    title="ML Model API",
    description="API for serving ML model predictions",
    version="1.0.0"
)

# Add CORS middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class DiagnosisModel(BaseModel):
    plant: str
    disease: str
    is_healthy: bool
    description: str
    causes: str
    remedies: list

class PredictionResponse(BaseModel):
    """Response model for predictions"""
    success: bool
    predictions: list = None
    diagnosis: DiagnosisModel = None
    error: str = None
    message: str = None

# Initialize model on startup
@app.on_event("startup")
async def startup_event():
    """Initialize model when the server starts"""
    try:
        model_path = os.path.join(os.path.dirname(__file__), "..", "best_model.h5")
        initialize_model(model_path)
        print("[OK] Model initialized at startup")
    except Exception as e:
        print(f"[ERROR] Error initializing model: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ML Model API",
        "version": "1.0.0"
    }

# Model info endpoint
@app.get("/api/model-info")
async def get_model_info():
    """Get information about the loaded model"""
    try:
        handler = get_model_handler()
        if handler.model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        info = handler.get_model_info()
        return {
            "success": True,
            "data": info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediction endpoint
@app.post("/api/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Make a plant leaf disease prediction using the loaded CNN model
    """
    try:
        handler = get_model_handler()
        
        if handler.model is None:
            return PredictionResponse(
                success=False,
                error="Model not loaded"
            )
        
        # Read the uploaded image bytes
        image_bytes = await file.read()
        
        # Perform image classification and get the diagnosis
        result = handler.predict(image_bytes)
        
        if result["success"]:
            return PredictionResponse(
                success=True,
                predictions=result["predictions"],
                diagnosis=result["diagnosis"],
                message="Plant health diagnosis successful"
            )
        else:
            return PredictionResponse(
                success=False,
                error=result["error"]
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference server error: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API documentation"""
    return {
        "message": "Welcome to ML Model API",
        "endpoints": {
            "health": "/health",
            "model_info": "/api/model-info",
            "predict": "/api/predict",
            "predict_batch": "/api/predict-batch",
            "docs": "/docs"
        },
        "documentation": "Visit /docs for interactive API documentation"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
