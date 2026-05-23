"""POST /compare — Compare two analyzed products side by side."""

import logging
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import CompareRequest, CompareResponse
from app.utils.firebase_admin import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=CompareResponse)
@limiter.limit("20/minute")
async def compare_products(
    request: Request,
    payload: CompareRequest,
    user: dict = Depends(get_current_user),
):
    a = payload.product_a
    b = payload.product_b

    score_a = a.health_score
    score_b = b.health_score

    if abs(score_a - score_b) <= 5:
        winner  = "tie"
        summary = (
            f"Both products are very similar in health profile. "
            f"{a.product_name or 'Product A'} scored {score_a}/100 and "
            f"{b.product_name or 'Product B'} scored {score_b}/100. "
            f"Consider other factors like taste and price."
        )
    elif score_a > score_b:
        winner = "A"
        diff   = score_a - score_b
        summary = (
            f"{a.product_name or 'Product A'} is the healthier choice, "
            f"scoring {score_a}/100 vs {score_b}/100 — {diff} points higher."
        )
        if b.harmful_count > a.harmful_count:
            summary += (
                f" {b.product_name or 'Product B'} has "
                f"{b.harmful_count - a.harmful_count} more flagged ingredients."
            )
    else:
        winner = "B"
        diff   = score_b - score_a
        summary = (
            f"{b.product_name or 'Product B'} is the healthier choice, "
            f"scoring {score_b}/100 vs {score_a}/100 — {diff} points higher."
        )
        if a.harmful_count > b.harmful_count:
            summary += (
                f" {a.product_name or 'Product A'} has "
                f"{a.harmful_count - b.harmful_count} more flagged ingredients."
            )

    return CompareResponse(
        winner=winner,
        summary=summary,
        product_a=a,
        product_b=b,
    )