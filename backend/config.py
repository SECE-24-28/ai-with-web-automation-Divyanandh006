"""
Configuration file for the FastAPI backend
"""
import os
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
BACKEND_ROOT = Path(__file__).parent
MODEL_PATH = os.getenv("MODEL_PATH", str(PROJECT_ROOT / "best_model.h5"))

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Model Configuration
MODEL_CACHE_SIZE = 1  # Number of models to cache
MODEL_LOAD_TIMEOUT = 60  # Timeout in seconds

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost",
    "127.0.0.1",
]

# Request Configuration
MAX_REQUEST_SIZE = 100 * 1024 * 1024  # 100 MB
REQUEST_TIMEOUT = 300  # 5 minutes

# Batch Configuration
MAX_BATCH_SIZE = 1000
DEFAULT_BATCH_SIZE = 32

# Logging Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Feature names (customize based on your model)
# Example: ["age", "income", "credit_score", ...]
FEATURE_NAMES = []

# Model metadata
MODEL_NAME = os.getenv("MODEL_NAME", "ML Model")
MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")
API_VERSION = "1.0.0"
