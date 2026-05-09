"""POST /save-profile — Save user health profile to Firestore."""

from fastapi import APIRouter, Depends, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import UserProfile
from app.utils.firebase_admin import get_current_user, get_db

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("")
@limiter.limit("10/minute")
async def save_profile(
    request: Request,
    payload: UserProfile,
    user: dict = Depends(get_current_user),
):
    """Save user profile to Firestore. Built fully in Phase 2."""
    try:
        db = get_db()
        db.collection("users").document(user["uid"]).set(
            payload.model_dump(), merge=True
        )
        return {"success": True, "message": "Profile saved."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
