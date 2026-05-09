"""POST /analyze — Run ingredient analysis on extracted text."""

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ScoreLabel
from app.utils.firebase_admin import get_current_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("", response_model=AnalyzeResponse)
@limiter.limit("30/minute")
async def analyze_ingredients(
    request: Request,
    payload: AnalyzeRequest,
    user: dict = Depends(get_current_user),
):
    """
    Run full ingredient analysis: harm detection, allergens, health score, AI summary.
    Built fully in Phase 4 & 5.
    """
    return AnalyzeResponse(
        product_name=payload.product_name or "Unknown product",
        ingredients=["Sugar", "Palm Oil", "Sodium Benzoate"],
        flagged_ingredients=[],
        allergens_detected=[],
        health_score=50,
        score_label=ScoreLabel.moderate,
        ai_summary="Full analysis coming in Phase 4.",
        personalized_warnings=[],
        alternatives=[],
        total_ingredients=3,
        harmful_count=0,
    )
