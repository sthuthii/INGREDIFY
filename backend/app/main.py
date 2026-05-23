"""
Ingredify Backend — FastAPI Application
"""

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routes import scan, analyze, compare, chat, history, profile
from app.utils.firebase_admin import init_firebase

# ── Rate limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Ingredify API",
    description="AI-Powered Food Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Firebase init ──────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    init_firebase()
    print("✅ Ingredify API started")
    print("📄 Docs: http://localhost:8000/docs")

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(scan.router,    prefix="/scan",         tags=["OCR & Scanning"])
app.include_router(analyze.router, prefix="/analyze",      tags=["Ingredient Analysis"])
app.include_router(compare.router, prefix="/compare",      tags=["Product Comparison"])
app.include_router(chat.router,    prefix="/chat",         tags=["AI Chatbot"])
app.include_router(history.router, prefix="/history",      tags=["Scan History"])
app.include_router(profile.router, prefix="/save-profile", tags=["User Profile"])

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "Ingredify API", "version": "1.0.0"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

# ── Global error handler ───────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )