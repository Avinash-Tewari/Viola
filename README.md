# 🎙️ Viola – AI Voice Assistant with LiveKit  

Viola is a real-time **AI-powered voice assistant** built with **LiveKit**, **React**, and **Flask**. It supports **voice input/output**, **live transcription**, and **AI-driven conversations**.  

---

## 🚀 Tech Stack  
- Frontend: React (Vite/Next.js), Tailwind CSS, LiveKit React SDK  
- Backend: Flask (Python), Flask-CORS  
- APIs: LiveKit Cloud  

---

## 🔧 Setup  

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

Frontend

```bash
cd frontend
npm install
npm run dev
```


🌐 Deployment

Frontend → Vercel/Netlify

Backend → Render/Railway


---

## 🔧 Installation  

### 1. Clone repo  
```bash
git clone https://github.com/yourusername/viola.git
cd viola
```
### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt

```

Create .env:
```bash
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=https://your-livekit-server
```

Run server:
```bash
python server.py
```
### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev   # development
npm run build # production
```
### 🚀 Deployment Guide

Frontend → Deploy on Vercel

Backend → Deploy Flask on Render
, Railway, or VPS


---


Add environment variables in your host’s dashboard

🔗 API Endpoints
POST /create-room

Creates a LiveKit room + returns access token.

---

Allows frontend client to join with generated token.

🧩 Roadmap / Future Features

 Multilingual support (EN, HI, ES, etc.)

 Video + voice conferencing

 User authentication (JWT + OAuth)

 Retrieval-Augmented Generation (RAG) for smarter AI

 ---

> © 2025 Viola. All rights reserved.


