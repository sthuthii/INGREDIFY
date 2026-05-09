"""POST /chat — AI nutrition chatbot."""

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ChatRequest, ChatResponse
from app.utils.firebase_admin import get_current_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    user: dict = Depends(get_current_user),
):
    """AI nutrition assistant chatbot. Built fully in Phase 5."""
    return ChatResponse(
        reply=f"You asked: '{payload.message}'. The full AI chatbot is built in Phase 5.",
    )
