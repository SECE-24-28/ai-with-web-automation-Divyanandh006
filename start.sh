#!/bin/bash

# Quick Start Script for ML Model Application (macOS/Linux)
# This script starts both backend and frontend

echo "================================"
echo "ML Model Prediction Interface"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ using: brew install python3"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js using: brew install node"
    exit 1
fi

echo "Python version: $(python3 --version)"
echo "Node.js version: $(node --version)"
echo ""

# Activate root virtual environment and install dependencies
echo ""
echo "Installing backend dependencies..."
source .venv/bin/activate
pip install -q -r backend/requirements.txt
echo "✓ Backend dependencies installed"

# Install frontend dependencies if needed
echo ""
echo "Installing frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    cd frontend
    npm install
    echo "✓ Frontend dependencies installed"
    cd ..
fi

# Start both servers in the background
echo ""
echo "Starting servers..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""

# Start backend
(
    cd backend
    source ../.venv/bin/activate
    python main.py
) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
(
    cd frontend
    npm start
) &
FRONTEND_PID=$!

echo "✓ Both servers are running"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep the script running
wait
