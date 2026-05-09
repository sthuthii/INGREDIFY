"""Firebase Admin SDK initialization and auth helpers."""

import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

_security = HTTPBearer()
_db = None


def init_firebase():
    """Initialize Firebase Admin SDK. Called once on startup."""
    global _db

    if firebase_admin._apps:
        return  # Already initialized

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # In production (Render), use environment variable JSON
        import json
        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if cred_json:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
        else:
            print("⚠️  No Firebase credentials found — auth will be disabled")
            return

    firebase_admin.initialize_app(cred)
    _db = firestore.client()
    print("🔥 Firebase Admin initialized")


def get_db():
    """Return Firestore client."""
    global _db
    if _db is None:
        _db = firestore.client()
    return _db


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(_security),
) -> dict:
    """
    Dependency — verifies Firebase ID token and returns decoded user.
    Usage:  user = Depends(get_current_user)
    """
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {e}")
