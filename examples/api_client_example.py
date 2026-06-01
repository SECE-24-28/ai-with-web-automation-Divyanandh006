"""
Example: Using the ML Model API with Python

This script demonstrates how to:
1. Connect to the FastAPI backend
2. Get model information
3. Make single predictions
4. Make batch predictions
"""

import requests
import json
import numpy as np
from typing import List, Dict

# Configuration
API_BASE_URL = "http://localhost:8000"
API_ENDPOINT_PREDICT = f"{API_BASE_URL}/api/predict"
API_ENDPOINT_MODEL_INFO = f"{API_BASE_URL}/api/model-info"
API_ENDPOINT_BATCH = f"{API_BASE_URL}/api/predict-batch"

class MLModelClient:
    """Client for interacting with the ML Model API"""
    
    def __init__(self, base_url: str = API_BASE_URL):
        """Initialize the client"""
        self.base_url = base_url
        self.model_info = None
    
    def get_model_info(self) -> Dict:
        """Get information about the model"""
        try:
            response = requests.get(f"{self.base_url}/api/model-info")
            response.raise_for_status()
            data = response.json()
            self.model_info = data.get("data")
            return self.model_info
        except requests.exceptions.RequestException as e:
            print(f"Error getting model info: {e}")
            return None
    
    def predict(self, input_data: List[float], description: str = "") -> Dict:
        """Make a single prediction"""
        payload = {
            "input_data": input_data,
            "description": description
        }
        
        try:
            response = requests.post(API_ENDPOINT_PREDICT, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making prediction: {e}")
            return {"success": False, "error": str(e)}
    
    def predict_batch(self, batch_data: List[List[float]]) -> Dict:
        """Make batch predictions"""
        payload = {"batch_data": batch_data}
        
        try:
            response = requests.post(API_ENDPOINT_BATCH, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error making batch prediction: {e}")
            return {"success": False, "error": str(e)}
    
    def predict_random(self, num_features: int = 10) -> Dict:
        """Make a prediction with random data"""
        random_data = np.random.randn(num_features).tolist()
        return self.predict(random_data, "Random test data")


def main():
    """Main example function"""
    
    print("=" * 60)
    print("ML Model API Client Example")
    print("=" * 60)
    print()
    
    # Initialize client
    client = MLModelClient()
    
    # 1. Check health
    print("1. Checking API health...")
    try:
        health = requests.get(f"{API_BASE_URL}/health").json()
        print(f"   ✓ API Status: {health.get('status')}")
    except:
        print("   ✗ Cannot connect to API. Make sure backend is running!")
        return
    
    print()
    
    # 2. Get model information
    print("2. Getting model information...")
    model_info = client.get_model_info()
    if model_info:
        print(f"   ✓ Input shape: {model_info.get('input_shape')}")
        print(f"   ✓ Output shape: {model_info.get('output_shape')}")
        print(f"   ✓ Number of layers: {model_info.get('num_layers')}")
        print(f"   ✓ Trainable parameters: {model_info.get('trainable_params'):,}")
    else:
        print("   ✗ Failed to get model information")
        return
    
    print()
    
    # 3. Make a single prediction
    print("3. Making a single prediction...")
    if model_info:
        # Determine input size from model
        input_shape = model_info.get('input_shape')
        if isinstance(input_shape, (list, tuple)):
            # Usually first dimension is batch size, last is features
            num_features = input_shape[-1] if len(input_shape) > 1 else input_shape[0]
        else:
            num_features = 10
        
        # Create random input
        test_input = np.random.randn(num_features).tolist()
        
        result = client.predict(test_input, "Single test prediction")
        if result.get('success'):
            print(f"   ✓ Prediction successful")
            print(f"   ✓ Output: {result.get('predictions')}")
        else:
            print(f"   ✗ Prediction failed: {result.get('error')}")
    
    print()
    
    # 4. Make batch predictions
    print("4. Making batch predictions...")
    if model_info:
        batch_size = 5
        test_batch = [
            np.random.randn(num_features).tolist() 
            for _ in range(batch_size)
        ]
        
        result = client.predict_batch(test_batch)
        if result.get('success'):
            print(f"   ✓ Batch prediction successful")
            print(f"   ✓ Batch size: {batch_size}")
            predictions = result.get('predictions')
            if predictions:
                print(f"   ✓ Output shape: {len(predictions)} x {len(predictions[0])}")
        else:
            print(f"   ✗ Batch prediction failed: {result.get('error')}")
    
    print()
    print("=" * 60)
    print("Example completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
