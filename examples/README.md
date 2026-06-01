# API Usage Examples

This directory contains examples of how to use the ML Model API.

## Python Client Example

### Running the Example

```bash
# Make sure backend is running (http://localhost:8000)

# Install requests if not already installed
pip install requests

# Run the example
python api_client_example.py
```

### What It Does

The example demonstrates:
1. Connecting to the API
2. Getting model information
3. Making single predictions
4. Making batch predictions
5. Handling errors gracefully

### Example Code

```python
from api_client_example import MLModelClient

# Initialize client
client = MLModelClient()

# Get model info
info = client.get_model_info()

# Make a prediction
result = client.predict([1.0, 2.0, 3.0, 4.0, 5.0])

# Make batch predictions
batch_result = client.predict_batch([
    [1.0, 2.0, 3.0],
    [4.0, 5.0, 6.0]
])
```

## cURL Testing

### Running the Tests

**On macOS/Linux:**
```bash
chmod +x test_api.sh
./test_api.sh
```

**On Windows:**
```bash
test_api.bat
```

### Individual Tests

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Get Model Info:**
```bash
curl http://localhost:8000/api/model-info
```

**Single Prediction:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"input_data": [1.0, 2.0, 3.0, 4.0, 5.0]}'
```

**Batch Prediction:**
```bash
curl -X POST http://localhost:8000/api/predict-batch \
  -H "Content-Type: application/json" \
  -d '{"batch_data": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]}'
```

## JavaScript/Node.js Example

Using axios or fetch:

```javascript
// Using fetch
const response = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input_data: [1.0, 2.0, 3.0, 4.0, 5.0]
  })
});

const result = await response.json();
console.log(result);
```

## Expected Responses

### Health Check Response
```json
{
  "status": "healthy",
  "service": "ML Model API",
  "version": "1.0.0"
}
```

### Model Info Response
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

### Prediction Response
```json
{
  "success": true,
  "predictions": [[0.1, 0.9, 0.0, ...]],
  "message": "Prediction successful"
}
```

## Troubleshooting

### Connection Refused
- Make sure backend is running: `python backend/main.py`
- Check URL is correct: `http://localhost:8000`

### Invalid JSON
- Ensure input_data is a list of numbers: `[1.0, 2.0, 3.0]`
- Check JSON syntax in request body

### Model Not Loaded
- Verify `best_model.h5` exists in project root
- Check backend console for load errors

## Interactive API Documentation

For interactive testing, visit:
```
http://localhost:8000/docs
```

This opens Swagger UI where you can:
- See all available endpoints
- Try requests in the browser
- See request/response schemas
- View status codes and error messages
