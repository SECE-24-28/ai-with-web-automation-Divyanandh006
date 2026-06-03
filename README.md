# Leaf Disease Detection

An end-to-end full-stack application for detecting plant leaf diseases using a Keras/TensorFlow model, a FastAPI backend, and a React frontend.

**Quick links:** [backend/main.py](backend/main.py) • [frontend](frontend) • [best_model.h5](best_model.h5) • [docker-compose.yml](docker-compose.yml)

## Features

- FastAPI backend with prediction and model-info endpoints
- React frontend for uploading images and viewing results
- Uses a Keras `.h5` model (`best_model.h5`) for inference
- Ready for local development and Docker deployment

## Getting Started (Local)

Prerequisites:

- Python 3.8+ (backend)
- Node.js 14+ and npm (frontend)
- Optional: Docker & Docker Compose

1) Backend (API)

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
```

Backend runs at http://localhost:8000 by default. API docs: http://localhost:8000/docs

2) Frontend (UI)

```bash
cd frontend
npm install
npm start
```

Frontend runs at http://localhost:3000 and should connect to the backend automatically when both are local.

## Docker (quick)

Start both services with Docker Compose (recommended for quick demos):

```bash
docker-compose up --build
```

This uses `Dockerfile.backend` and `Dockerfile.frontend` in the repo.

## API Overview

- GET /health — health check
- GET /api/model-info — returns model input/output shapes and metadata
- POST /api/predict — submit a single input (or image) for prediction
- POST /api/predict-batch — batch predictions

See the running API docs at `/docs` for the exact request/response formats.

Example curl (single prediction):

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"input_data": [1.0,2.0,3.0]}'
```

## Project Layout

- [backend](backend/) — FastAPI app, model loader, and requirements
- [frontend](frontend/) — React app (create-react-app structure)
- best_model.h5 — trained Keras model used by the backend
- docker-compose.yml, Dockerfile.backend, Dockerfile.frontend — deployment

## Model Notes

Place your Keras model file `best_model.h5` at the repository root (next to this README). The backend expects the model at that path by default; adjust `backend/main.py` if you need a different location.

If training a model yourself, save it with:

```python
model.save('best_model.h5')
```

## Troubleshooting

- `ModuleNotFoundError: No module named 'tensorflow'` — ensure backend venv is activated and `pip install -r backend/requirements.txt` completes successfully.
- CORS / connection issues — confirm backend URL and port, and check `frontend/package.json` proxy settings.

## Contributing

PRs are welcome. Please open issues for bugs or feature requests.

## License

MIT

---

If you want, I can also:

- add badges (CI / license),
- provide a short `CONTRIBUTING.md`, or
- preview the README in Markdown.
