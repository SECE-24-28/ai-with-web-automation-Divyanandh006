# Full-Stack AI Chatbot (Gemini)

A full-stack AI chatbot with a React + Vite frontend and an Express + SQLite backend powered by Google Gemini.

## Features

- **Authentication** – Register, login, and email verification with 6-digit OTP
- **Multi-Chat Sessions** – Create, rename, delete, and switch between chats
- **AI Responses** – Powered by Google Gemini (`gemini-2.0-flash`)
- **Code Highlighting** – Code block rendering with copy-to-clipboard
- **Responsive UI** – Glassmorphism dark theme, works on mobile and desktop
- **Persistent Storage** – SQLite database with WAL mode

## Quick Start

### 1. Backend

```bash
cd chatbot/backend
npm install
# Add your Gemini API key to .env (see below)
npm run dev
```

The backend runs on **http://localhost:3002**

### 2. Frontend

```bash
cd chatbot/frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Environment Variables (backend/.env)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3002

# Optional: SMTP for real email delivery (omit to use dev console fallback)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=you@gmail.com
# SMTP_PASS=your_app_password
```

> **Dev mode:** If SMTP is not configured, verification codes are printed to the backend terminal console.

## API Endpoints

| Method | Route                          | Description               |
|--------|-------------------------------|---------------------------|
| POST   | /api/auth/register            | Register a new user       |
| POST   | /api/auth/verify              | Verify email with OTP     |
| POST   | /api/auth/login               | Login and receive JWT     |
| POST   | /api/auth/resend-verification | Resend OTP code           |
| GET    | /api/chats                    | List all user chats       |
| POST   | /api/chats                    | Create a new chat         |
| PATCH  | /api/chats/:id                | Rename a chat             |
| DELETE | /api/chats/:id                | Delete a chat             |
| GET    | /api/messages/:chatId         | Get messages for a chat   |
| POST   | /api/messages/:chatId         | Send a message (AI reply) |
| GET    | /api/health                   | Backend health check      |
