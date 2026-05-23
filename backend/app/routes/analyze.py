"""POST /analyze — Run full ingredient analysis with AI summary."""

import logging
from fastapi import APIRouter, Depends, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ScoreLabel
from app.utils.firebase_admin import get_current_user, get_db
from app.services.ocr_service import parse_ingredients
from app.services.analysis_service import run_analysis
from app.services.ai_service import generate_ai_summary

logger = logging.getLogger(__name__)
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
    Full analysis pipeline:
    1. Parse ingredients from OCR text
    2. Run harm detection, allergen check, health scoring
    3. Generate AI health summary via Claude
    4. Save to Firestore history
    """

    if not payload.extracted_text.strip():
        raise HTTPException(status_code=422, detail="extracted_text cannot be empty.")

    # 1. Parse
    ingredients = parse_ingredients(payload.extracted_text)
    if not ingredients:
        raise HTTPException(status_code=422, detail="No ingredients could be parsed from the text.")

    # 2. Rule-based analysis
    try:
        result = run_analysis(
            ingredients=ingredients,
            user_profile=payload.user_profile,
        )
    except Exception as e:
        logger.error(f"Analysis failed for user {user.get('uid')}: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")

    # 3. AI summary (Claude) — falls back to rule-based if API unavailable
    ai_summary = await generate_ai_summary(
        ingredients=ingredients,
        flagged_ingredients=result["flagged_ingredients"],
        health_score=result["health_score"],
        score_label=result["score_label"],
        personalized_warnings=result["personalized_warnings"],
    )

    # 4. Save to Firestore history
    try:
        from google.cloud.firestore import SERVER_TIMESTAMP
        db = get_db()
        scan_ref = db.collection("users").document(user["uid"]).collection("scans").document()
        scan_ref.set({
            "product_name":   payload.product_name or "Unknown product",
            "health_score":   result["health_score"],
            "score_label":    result["score_label"],
            "ingredients":    ingredients,
            "harmful_count":  result["harmful_count"],
            "allergens":      result["allergens_detected"],
            "extracted_text": payload.extracted_text,
            "ai_summary":     ai_summary,
            "created_at":     SERVER_TIMESTAMP,
            "bookmarked":     False,
        })
    except Exception as e:
        logger.warning(f"Could not save scan history: {e}")

    return AnalyzeResponse(
        product_name=payload.product_name or "Unknown product",
        ingredients=ingredients,
        flagged_ingredients=result["flagged_ingredients"],
        allergens_detected=result["allergens_detected"],
        health_score=result["health_score"],
        score_label=ScoreLabel(result["score_label"]),
        ai_summary=ai_summary,
        personalized_warnings=result["personalized_warnings"],
        alternatives=result["alternatives"],
        total_ingredients=result["total_ingredients"],
        harmful_count=result["harmful_count"],
    )