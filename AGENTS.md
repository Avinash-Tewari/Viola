# AGENTS.md

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Linux/Mac)
venv\Scripts\activate     # (Windows)
pip install -r requirements.txt
```

Create .env:
```bash
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=https://your-livekit-server
```

Run server:
```bash
python server.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

Frontend → Vercel/Netlify
Backend → Render/Railway

## API Endpoints

POST /create-room

Creates a LiveKit room + returns access token.

Allows frontend client to join with generated token.

## Tech Stack

- Frontend: React (Vite/Next.js), Tailwind CSS, LiveKit React SDK
- Backend: Flask (Python), Flask-CORS
- APIs: LiveKit Cloud

## Roadmap / Future Features

- Multilingual support (EN, HI, ES, etc.)
- Video + voice conferencing
- User authentication (JWT + OAuth)
- Retrieval-Augmented Generation (RAG) for smarter AI
