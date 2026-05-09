"""GET /history — Retrieve user scan history from Firestore."""

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.utils.firebase_admin import get_current_user, get_db

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("")
@limiter.limit("30/minute")
async def get_history(
    request: Request,
    user: dict = Depends(get_current_user),
):
    """Get user's scan history. Built fully in Phase 6."""
    return {"scans": [], "message": "History feature built in Phase 6."}
