"""POST /chat — AI nutrition assistant chatbot."""

import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ChatRequest, ChatResponse
from app.utils.firebase_admin import get_current_user
from app.services.ai_service import chat_with_assistant

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    user: dict = Depends(get_current_user),
):
    if not payload.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    if len(payload.message) > 1000:
        raise HTTPException(status_code=422, detail="Message too long. Max 1000 characters.")

    try:
        reply = await chat_with_assistant(
            message=payload.message,
            context=payload.context,
        )
    except Exception as e:
        logger.error(f"Chat error for user {user.get('uid')}: {e}")
        raise HTTPException(status_code=500, detail="Chat service unavailable.")

    return ChatResponse(reply=reply)