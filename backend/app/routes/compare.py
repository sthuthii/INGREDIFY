"""POST /compare — Compare two analyzed products."""

from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import CompareRequest, CompareResponse
from app.utils.firebase_admin import get_current_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("", response_model=CompareResponse)
@limiter.limit("20/minute")
async def compare_products(
    request: Request,
    payload: CompareRequest,
    user: dict = Depends(get_current_user),
):
    """Compare two products side-by-side. Built fully in Phase 6."""
    winner = "A" if payload.product_a.health_score > payload.product_b.health_score else "B"
    return CompareResponse(
        winner=winner,
        summary=f"Product {winner} has a higher health score.",
        product_a=payload.product_a,
        product_b=payload.product_b,
    )
