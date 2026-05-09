"""POST /scan — Upload image, preprocess with OpenCV, extract text via EasyOCR."""

import base64
import logging
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ScanResponse
from app.utils.firebase_admin import get_current_user
from app.services.image_processor import preprocess_image, generate_thumbnail
from app.services.ocr_service import extract_text, parse_ingredients

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_SIZE_MB = 10


@router.post("", response_model=ScanResponse)
@limiter.limit("20/minute")
async def scan_label(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """
    Full pipeline:
    1. Validate file type + size
    2. Preprocess image with OpenCV (denoise, contrast, sharpen)
    3. Run EasyOCR to extract text
    4. Clean and parse ingredient list
    5. Return structured result
    """

    # ── 1. Validate ──────────────────────────────────────────────────────────
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{content_type}'. Upload JPEG, PNG, or WebP.",
        )

    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(status_code=422, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(image_bytes) // (1024*1024)}MB). Max {MAX_SIZE_MB}MB.",
        )

    # ── 2. Preprocess ────────────────────────────────────────────────────────
    try:
        processed_image = preprocess_image(image_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Preprocessing error for user {user.get('uid')}: {e}")
        raise HTTPException(status_code=500, detail="Image preprocessing failed.")

    # ── 3. OCR ───────────────────────────────────────────────────────────────
    try:
        ocr_result = extract_text(processed_image)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ── 4. Parse ingredients ─────────────────────────────────────────────────
    ingredients = parse_ingredients(ocr_result["text"])

    if not ocr_result["text"].strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from this image. Try a clearer photo.",
        )

    # ── 5. Thumbnail (base64 for frontend preview) ────────────────────────────
    try:
        thumb_bytes   = generate_thumbnail(image_bytes)
        thumbnail_b64 = base64.b64encode(thumb_bytes).decode("utf-8")
    except Exception:
        thumbnail_b64 = None

    logger.info(
        f"Scan complete — user={user.get('uid')} "
        f"ingredients={len(ingredients)} confidence={ocr_result['confidence']}%"
    )

    return ScanResponse(
        text=ocr_result["text"],
        confidence=ocr_result["confidence"],
        raw_text=ocr_result.get("raw_text"),
        ingredients=ingredients,
        thumbnail=thumbnail_b64,
    )