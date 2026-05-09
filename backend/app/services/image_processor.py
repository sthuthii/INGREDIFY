"""
Image preprocessing service.
Takes raw image bytes → returns a sharpened, denoised, contrast-enhanced
numpy array ready for OCR.
"""

import cv2
import numpy as np
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Full preprocessing pipeline:
    1. Decode image
    2. Convert to grayscale
    3. Denoise
    4. Increase contrast (CLAHE)
    5. Sharpen
    6. Threshold / binarise
    Returns BGR numpy array for EasyOCR.
    """
    try:
        # Decode bytes → numpy
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Could not decode image — unsupported format or corrupt file.")

        # ── Resize if too large (speeds up OCR without losing readability) ──
        max_dim = 1600
        h, w = img.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        # ── Grayscale ────────────────────────────────────────────────────────
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # ── Denoise ──────────────────────────────────────────────────────────
        denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

        # ── CLAHE contrast enhancement ────────────────────────────────────────
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        contrasted = clahe.apply(denoised)

        # ── Sharpening kernel ─────────────────────────────────────────────────
        kernel = np.array([
            [0, -1,  0],
            [-1,  5, -1],
            [0, -1,  0],
        ])
        sharpened = cv2.filter2D(contrasted, -1, kernel)

        # ── Adaptive threshold (helps with uneven lighting on labels) ─────────
        binary = cv2.adaptiveThreshold(
            sharpened, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=11,
            C=2,
        )

        # Return as 3-channel for EasyOCR compatibility
        result = cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)
        logger.info(f"Preprocessing complete — output shape: {result.shape}")
        return result

    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        # Fall back to raw decode if preprocessing fails
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Image could not be decoded.")
        return img


def image_to_pil(image_bytes: bytes) -> Image.Image:
    """Convert raw bytes to PIL Image (for thumbnail generation)."""
    return Image.open(io.BytesIO(image_bytes))


def generate_thumbnail(image_bytes: bytes, size: tuple = (200, 200)) -> bytes:
    """
    Generate a base64-ready thumbnail of the uploaded image.
    Returns JPEG bytes.
    """
    img = image_to_pil(image_bytes)
    img.thumbnail(size, Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=75)
    return buf.getvalue()