"""
OCR service using EasyOCR.
Extracts ingredient text from preprocessed images,
cleans OCR noise, and returns confidence scores.
"""

import re
import logging
import numpy as np
from typing import Optional

logger = logging.getLogger(__name__)

# ── Lazy-load EasyOCR reader (heavy model, load once) ────────────────────────
_reader = None

def get_reader():
    """Return a cached EasyOCR reader. Initialises on first call."""
    global _reader
    if _reader is None:
        try:
            import easyocr
            logger.info("Loading EasyOCR model (first run may take a moment)...")
            _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
            logger.info("EasyOCR model loaded.")
        except ImportError:
            logger.warning("EasyOCR not installed — OCR will return mock data.")
            _reader = None
    return _reader


# ── Common OCR noise patterns ─────────────────────────────────────────────────
NOISE_PATTERNS = [
    r"\b[A-Z0-9]{1}\b",          # Single stray characters
    r"[^\x00-\x7F]+",            # Non-ASCII artifacts
    r"\s{2,}",                   # Multiple spaces → single
    r"[|\\]{2,}",                # Repeated pipe / backslash artifacts
]

# ── Ingredient section markers (OCR often picks up label headers) ─────────────
INGREDIENT_HEADERS = [
    r"ingredients?\s*:?",
    r"contains?\s*:?",
    r"made\s+with\s*:?",
    r"composition\s*:?",
]


def extract_text(image_array: np.ndarray) -> dict:
    """
    Run EasyOCR on a preprocessed image array.

    Returns:
        {
            "text": str,        # cleaned, joined ingredient text
            "raw_text": str,    # raw OCR output joined
            "confidence": float # mean confidence 0-100
        }
    """
    reader = get_reader()

    if reader is None:
        # EasyOCR not available — return a realistic mock for dev/testing
        logger.warning("Using mock OCR output (EasyOCR not available).")
        return _mock_ocr_result()

    try:
        results = reader.readtext(image_array, detail=1, paragraph=False)

        if not results:
            return {"text": "", "raw_text": "", "confidence": 0.0}

        # results: list of (bbox, text, confidence)
        texts       = [r[1] for r in results]
        confidences = [r[2] for r in results]

        raw_text   = " ".join(texts)
        mean_conf  = round(float(np.mean(confidences)) * 100, 1)

        cleaned = clean_ocr_text(raw_text)

        return {
            "text":       cleaned,
            "raw_text":   raw_text,
            "confidence": mean_conf,
        }

    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise RuntimeError(f"OCR failed: {e}")


def clean_ocr_text(raw: str) -> str:
    """
    Clean raw OCR output:
    - Remove ingredient section headers
    - Normalise separators
    - Strip noise patterns
    - Normalise whitespace
    """
    text = raw

    # Remove common label headers (case-insensitive)
    for pattern in INGREDIENT_HEADERS:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

    # Normalise separators — periods and semicolons → commas
    text = re.sub(r"[.;]\s*(?=[A-Z])", ", ", text)

    # Remove noise
    text = re.sub(r"[^\x00-\x7F]+", " ", text)   # Non-ASCII
    text = re.sub(r"[|\\]{2,}", " ", text)         # Repeated pipes
    text = re.sub(r"\s{2,}", " ", text)            # Multiple spaces

    # Capitalise first letter of each ingredient token
    text = text.strip()

    return text


def parse_ingredients(text: str) -> list[str]:
    """
    Split cleaned OCR text into individual ingredient names.
    Handles comma, slash, and bullet-separated lists.
    Filters out very short tokens that are likely OCR noise.
    """
    # Split on commas, semicolons, or bullet points
    tokens = re.split(r"[,;•·\n]+", text)

    ingredients = []
    for token in tokens:
        token = token.strip().strip("()[]{}*-").strip()
        # Skip tokens that are too short or pure numbers
        if len(token) < 2 or re.match(r"^\d+(\.\d+)?%?$", token):
            continue
        ingredients.append(token)

    return ingredients


def _mock_ocr_result() -> dict:
    """Realistic mock OCR result for development without EasyOCR installed."""
    mock_text = (
        "Sugar, Enriched Flour (Wheat Flour, Niacin, Reduced Iron, "
        "Thiamine Mononitrate, Riboflavin, Folic Acid), Palm Oil, "
        "High Fructose Corn Syrup, Sodium Benzoate, Artificial Flavors, "
        "Artificial Colors (Red 40, Yellow 5, Blue 1), "
        "BHA (to preserve freshness), Carrageenan, "
        "Monosodium Glutamate, Partially Hydrogenated Soybean Oil"
    )
    return {
        "text":       mock_text,
        "raw_text":   mock_text,
        "confidence": 91.5,
    }