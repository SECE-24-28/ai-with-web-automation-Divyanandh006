# Quick Start Guide

## On Windows

### Option 1: Using the start script (Easiest)
1. Open Command Prompt
2. Navigate to project directory: `cd path\to\model_frontend_building`
3. Run: `start.bat`
4. Wait for both terminal windows to open
5. Open browser to: `http://localhost:3000`

### Option 2: Manual startup
**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

---

## On macOS/Linux

### Option 1: Using the start script (Easiest)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Using Make
```bash
make install    # First time only
make start
```

### Option 3: Manual startup
**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

---

## Using Docker (All platforms)

```bash
# Build and run all services
docker-compose up

# Or build first, then run
docker-compose build
docker-compose up
```

---

## First Steps

1. ✅ Ensure `best_model.h5` is in the project root
2. ✅ Backend should show: "✓ Model loaded successfully"
3. ✅ Frontend opens at `http://localhost:3000`
4. ✅ Try a prediction with random values

## Important URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## Troubleshooting

**"Port already in use"**
- Change port in `backend/main.py` or `frontend/package.json`

**"Model not found"**
- Verify `best_model.h5` is in project root directory

**"Cannot connect to backend"**
- Check backend is running: `http://localhost:8000/health`
- Check browser console for errors
- Verify CORS is enabled

**Dependencies won't install**
- Clear cache: `pip cache purge` or `npm cache clean --force`
- Try fresh installation in new virtual environment/directory

## Next Steps

1. 📖 Read [README.md](README.md) for full documentation
2. 🔧 Check API docs at http://localhost:8000/docs
3. 🎨 Customize frontend colors in `frontend/src/App.css`
4. 🚀 Deploy to cloud using Docker

Enjoy! 🚀
