#!/bin/bash

# API Testing Examples using curl
# Run these commands to test your API

BASE_URL="http://localhost:8000"

echo "ML Model API Testing Examples"
echo "============================="
echo ""

# 1. Health Check
echo "1. Health Check"
echo "   Command:"
echo "   curl $BASE_URL/health"
echo ""
curl "$BASE_URL/health"
echo ""
echo ""

# 2. Get Model Info
echo "2. Get Model Information"
echo "   Command:"
echo "   curl $BASE_URL/api/model-info"
echo ""
curl "$BASE_URL/api/model-info"
echo ""
echo ""

# 3. Make a Prediction
echo "3. Make a Single Prediction"
echo "   Command:"
echo "   curl -X POST $BASE_URL/api/predict \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"input_data\": [1.0, 2.0, 3.0, 4.0, 5.0]}'"
echo ""
curl -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"input_data": [1.0, 2.0, 3.0, 4.0, 5.0]}'
echo ""
echo ""

# 4. Make Batch Predictions
echo "4. Make Batch Predictions"
echo "   Command:"
echo "   curl -X POST $BASE_URL/api/predict-batch \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"batch_data\": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]}'"
echo ""
curl -X POST "$BASE_URL/api/predict-batch" \
  -H "Content-Type: application/json" \
  -d '{"batch_data": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]}'
echo ""
echo ""

# 5. Root Endpoint
echo "5. API Root (Documentation Links)"
echo "   Command:"
echo "   curl $BASE_URL/"
echo ""
curl "$BASE_URL/"
echo ""
echo ""

echo "============================="
echo "Testing completed!"
echo ""
echo "To see interactive API documentation, visit:"
echo "   $BASE_URL/docs"
echo ""
