# 🌿 Ingredify — AI-Powered Food Intelligence Platform

> Scan any packaged food label. Get instant AI analysis of ingredients, allergens, health risks, and personalized nutrition insights.

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/ingredify.git
cd ingredify

# 2. Frontend setup
cd frontend
cp .env.example .env.local    # Fill in your Firebase config
npm install
npm run dev                    # http://localhost:5173

# 3. Backend setup (new terminal)
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your Firebase credentials
uvicorn app.main:app --reload  # http://localhost:8000
```

---

## 🏗️ Architecture

```
ingredify/
├── frontend/                    # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── auth/            # Login, Signup, ProtectedRoute
│       │   ├── ui/              # Navbar, Cards, Loaders
│       │   ├── scan/            # Image upload, OCR results
│       │   ├── dashboard/       # Charts, analytics
│       │   └── chat/            # AI chatbot UI
│       ├── pages/               # Route-level page components
│       ├── hooks/               # useAuth, useTheme
│       └── lib/                 # Firebase, API client, utils
│
└── backend/                     # FastAPI (Python)
    └── app/
        ├── routes/              # scan, analyze, compare, chat, history, profile
        ├── services/            # OCR, analysis, AI, recommendations
        ├── utils/               # Firebase admin, helpers
        ├── models/              # Pydantic schemas
        ├── data/                # Ingredient database, allergen lists
        └── ml/                  # Health scoring, classification models
```

---

## ✨ Features

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project setup, routing, Firebase config | ✅ Done |
| 2 | Auth (signup/login), user profiles | 🔲 Next |
| 3 | Image upload, OCR, preprocessing | 🔲 |
| 4 | Ingredient analysis engine, health score | 🔲 |
| 5 | AI summary, chatbot, alternatives | 🔲 |
| 6 | Dashboard charts, history, comparison | 🔲 |
| 7 | Deployment, polish, README | 🔲 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan` | Upload image → OCR extraction |
| POST | `/analyze` | Ingredient analysis + health score |
| POST | `/compare` | Side-by-side product comparison |
| POST | `/chat` | AI nutrition chatbot |
| GET | `/history` | User scan history |
| POST | `/save-profile` | Save health profile |

---

## 🔧 Tech Stack

**Frontend**: React 18 · Vite · Tailwind CSS · Framer Motion · React Router · Recharts · Lucide

**Backend**: FastAPI · Python 3.11+ · Uvicorn · Pydantic v2

**AI/ML**: EasyOCR · OpenCV · HuggingFace Transformers · PyTorch · scikit-learn

**Database & Auth**: Firebase Authentication · Firestore

**Deployment**: Vercel (frontend) · Render (backend)

---

## ⚙️ Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create project
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database** → Start in test mode
4. Frontend: **Project Settings → Your apps → Web app** → copy config → paste in `.env.local`
5. Backend: **Project Settings → Service Accounts → Generate new private key** → save as `firebase-credentials.json`

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → import in Vercel → add env vars from .env.local
```

### Backend → Render
1. Create a new **Web Service** in Render
2. Connect your GitHub repo
3. Set **Build command**: `pip install -r requirements.txt`
4. Set **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `FIREBASE_CREDENTIALS_JSON`, `HUGGINGFACE_API_TOKEN`

---

## 📄 License

MIT — free to use for personal projects, portfolios, and hackathons.
