# AI Chatbot (Gemini)

A lightweight full-stack AI chat application built with React + Vite (frontend) and Express + SQLite (backend). Messages are generated via Google Gemini using `@google/generative-ai`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Node.js](https://img.shields.io/badge/Node-16%2B-green)](#) [![Status](https://img.shields.io/badge/status-development-yellowgreen)](#)

A compact demo project intended for learning and prototyping local AI chat integrations.

## Table of Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Running locally (development)](#running-locally-development)
- [Usage examples](#usage-examples)
- [API overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

## Features

- Email registration with 6-digit verification (SMTP optional, falls back to console)
- JWT-based authentication for protected routes
- Create / rename / delete chats with per-chat message history
- AI responses via Google Gemini (`GEMINI_API_KEY`)

## Tech stack

- Backend: Node.js, Express, `better-sqlite3`, `@google/generative-ai`
- Frontend: React, Vite

## Prerequisites

- Node.js (16+ recommended)
- npm or yarn

## Environment variables
Create a `.env` file in `backend/` (see [backend/server.js](backend/server.js#L1) and [backend/routes/messages.js](backend/routes/messages.js#L1)). A sample is provided at `backend/.env.example`.

Example keys (do not commit real secrets):

```
PORT=3002
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional SMTP settings for real email delivery (omit to use console fallback)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
```

- If SMTP is not configured verification codes are printed to the backend console for development convenience.
- The backend creates a local SQLite DB file `chatbot.db` inside `backend/` at runtime (see [backend/db.js](backend/db.js#L1)).

## Running locally (development)

1. Backend

```bash
cd backend
npm install
# start with auto-reload
npm run dev
```

The backend listens on `http://localhost:3002` by default.

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server (Vite) typically runs at `http://localhost:5173` and communicates with the backend at `http://localhost:3002/api` (see [frontend/src/services/api.js](frontend/src/services/api.js#L1)).

## Usage examples

Register a user, verify, login, then send a message. Example flow using `curl`:

1) Register

```bash
curl -X POST http://localhost:3002/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

2) (Check backend console for verification code or receive email if SMTP configured)

3) Verify

```bash
curl -X POST http://localhost:3002/api/auth/verify \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","code":"123456"}'
```

4) Login

```bash
curl -X POST http://localhost:3002/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"password123"}'
```

5) Send a message (replace `TOKEN` and `CHAT_ID`)

```bash
curl -X POST http://localhost:3002/api/messages/CHAT_ID \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer TOKEN" \
	-d '{"content":"Hello, AI!"}'
```

## API overview

Key endpoints (base `/api`):

- `POST /api/auth/register` — register a new user
- `POST /api/auth/verify` — verify email with OTP
- `POST /api/auth/login` — login and receive JWT
- `POST /api/auth/resend-verification` — resend OTP
- `GET /api/chats` — list user chats
- `POST /api/chats` — create chat
- `PATCH /api/chats/:id` — rename chat
- `DELETE /api/chats/:id` — delete chat
- `GET /api/messages/:chatId` — get messages
- `POST /api/messages/:chatId` — send message / receive AI reply

## Screenshot / Demo

Add a screenshot or GIF to `frontend/public/screenshot.png` and embed it here:

![App screenshot](frontend/public/screenshot.png)

## Notes & security

- Do not commit `.env` or any secret values. Keep `JWT_SECRET` and `GEMINI_API_KEY` private.
- This project is intended for learning and prototyping. Harden auth, rate limiting, input validation, and secrets handling before using in production.

## Contributing

Contributions are welcome — open an issue or submit a pull request with a clear description and tests where applicable. See `CONTRIBUTING.md` (optional).

## License

This project is available under the MIT License — see the `LICENSE` file.

## Contact

Open an issue or contact the repository owner for questions.
