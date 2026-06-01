.PHONY: help install setup-backend setup-frontend start start-backend start-frontend clean

help:
	@echo "ML Model Prediction Interface - Available Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make install          - Install all dependencies"
	@echo "  make setup-backend    - Setup backend only"
	@echo "  make setup-frontend   - Setup frontend only"
	@echo ""
	@echo "Run Commands:"
	@echo "  make start            - Start both backend and frontend"
	@echo "  make start-backend    - Start backend only"
	@echo "  make start-frontend   - Start frontend only"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean            - Remove virtual env and node_modules"
	@echo "  make clean-backend    - Remove backend venv"
	@echo "  make clean-frontend   - Remove frontend node_modules"

install: setup-backend setup-frontend
	@echo "✓ All dependencies installed"

setup-backend:
	@echo "Setting up backend..."
	cd backend && python3 -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt
	@echo "✓ Backend setup complete"

setup-frontend:
	@echo "Setting up frontend..."
	cd frontend && npm install
	@echo "✓ Frontend setup complete"

start:
	@echo "Starting ML Model Application..."
	@echo "Backend will run on: http://localhost:8000"
	@echo "Frontend will run on: http://localhost:3000"
	@echo ""
	@make start-backend & \
	sleep 3 && \
	make start-frontend

start-backend:
	@echo "Starting backend server..."
	cd backend && . venv/bin/activate && python main.py

start-frontend:
	@echo "Starting frontend server..."
	cd frontend && npm start

clean: clean-backend clean-frontend
	@echo "✓ Cleanup complete"

clean-backend:
	@echo "Removing backend virtual environment..."
	rm -rf backend/venv

clean-frontend:
	@echo "Removing frontend node_modules..."
	rm -rf frontend/node_modules
