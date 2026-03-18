# Infinite Helix — AI Micro Wellness Assistant

A background AI assistant that helps women employees manage work, emotions, energy, and mental well-being with **context-aware wellness nudges**, **emotion AI**, and **cycle-aware insights**.

## Quick Start (One-Command Demo)

```bash
# 1. Backend
cd Infinite_helix/backend
python setup_demo.py      # Creates .env, installs deps
python run.py              # Starts Flask on :5000

# 2. Frontend (new terminal)
cd Infinite_helix/frontend
npm install
npm run dev                # Starts React on :3000
```

Open **http://localhost:3000** — register or sign in to start.

## Architecture

```
Infinite_helix/
├── backend/                     Python Flask REST API
│   ├── app/
│   │   ├── ai/                  Emotion & Sentiment (HuggingFace / demo mock)
│   │   ├── tracker/             Keyboard, mouse, screen tracking (pynput/psutil)
│   │   ├── notifications/       Desktop toasts (plyer) + in-app queue
│   │   ├── routes/              12 API blueprints
│   │   ├── services/            Firebase, Calendar, Reports
│   │   └── models/              Firestore schemas
│   ├── config/settings.py       Environment-based config
│   ├── setup_demo.py            One-command setup
│   └── run.py                   Entry point
│
└── frontend/                    React 18 + Tailwind CSS SPA
    └── src/
        ├── pages/               Dashboard, Journal, Reports, Calendar, CycleMode, Settings, Auth
        ├── components/          20+ feature components
        ├── context/             AuthContext (Firebase), WellnessContext (API-connected)
        ├── hooks/               useEmotionAnalysis, useWellnessPolling
        └── services/            API client, Firebase, Notifications
```

## Features

| Feature | Description |
|---------|-------------|
| **Work Behavior Tracking** | Keyboard/mouse activity, idle detection, continuous work monitoring (pynput + psutil) |
| **Context-Aware Nudges** | Smart reminders — hydration, stretch, eye rest, breathing — that feel supportive, not intrusive |
| **Emotion & Sentiment AI** | HuggingFace models detect emotion (7 classes) and sentiment, with supportive reframing for stress |
| **Cycle Energy Mode** | Optional menstrual phase logging — adjusts nudges based on energy levels (private, toggleable) |
| **Pre-Meeting Calm** | Google Calendar integration detects meetings, sends breathing suggestions beforehand |
| **Multi-Channel Notifications** | Desktop toasts (plyer) + browser Web Notifications API + in-app overlay |
| **Dashboard & Reports** | Real-time wellness score, screen time charts, stress heatmap, weekly report cards |
| **Emotion Journal** | Write entries, get instant AI emotion analysis with confidence scores |
| **Authentication** | Firebase Auth — email/password + Google OAuth 2.0 sign-in |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Chart.js, React Router 6 |
| Backend | Python Flask, Flask-CORS |
| AI/ML | HuggingFace Transformers (DistilRoBERTa, RoBERTa) |
| Database | Firebase Firestore (in-memory fallback for demo) |
| Auth | Firebase Authentication (email + Google OAuth 2.0) |
| Tracking | psutil, pynput |
| Notifications | plyer (desktop), Web Notifications API (browser) |
| Calendar | Google Calendar API v3 |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check + demo mode status |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/sync` | Profile sync on login |
| GET | `/api/dashboard/today` | Live dashboard metrics with tracker data |
| POST | `/api/journal` | Create journal entry with emotion/sentiment AI |
| GET | `/api/journal` | List journal entries |
| POST | `/api/emotion/analyze` | Standalone emotion detection |
| POST | `/api/sentiment/analyze` | Standalone sentiment analysis |
| GET | `/api/tracker/status` | Real-time activity + screen tracking stats |
| POST | `/api/nudge/generate` | Context-aware nudge generation |
| GET | `/api/nudge/pending` | Pending notifications |
| GET | `/api/reports/weekly` | Weekly wellness report |
| GET | `/api/calendar/meetings` | Today's meetings |
| GET | `/api/cycle/suggestions/:phase` | Cycle-phase suggestions |
| POST | `/api/hydration/log` | Log water intake |
| GET | `/api/hydration/today` | Today's hydration count |

## Demo Mode

Set `DEMO_MODE=true` in `.env` (default). This:
- Uses keyword-based emotion/sentiment detection (no model download)
- Falls back to in-memory storage (no Firebase required)
- Generates realistic mock data for calendar, reports
- Reduces nudge cooldown to 5 minutes for demo visibility
- Desktop notifications via plyer (cross-platform)

## Environment Variables

See `backend/.env.example` for all available configuration options.

## Team

**Team Infinite Helix** — Built for hackathon with focus on women-centric wellness while keeping inclusivity (cycle tracking is optional and private).
