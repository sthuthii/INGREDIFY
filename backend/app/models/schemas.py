"""Pydantic models for all API request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────────────

class Severity(str, Enum):
    low      = "Low"
    medium   = "Medium"
    high     = "High"
    critical = "Critical"

class ScoreLabel(str, Enum):
    healthy  = "Healthy"
    moderate = "Moderate"
    risky    = "Risky"


# ── Ingredient analysis ───────────────────────────────────────────────────────

class IngredientFlag(BaseModel):
    ingredient:  str
    risk:        str
    severity:    Severity
    explanation: str
    category:    Optional[str] = None

class PersonalizedWarning(BaseModel):
    condition: str
    message:   str
    severity:  Severity

class NutritionInfo(BaseModel):
    calories:     Optional[float] = None
    protein_g:    Optional[float] = None
    carbs_g:      Optional[float] = None
    fat_g:        Optional[float] = None
    sugar_g:      Optional[float] = None
    sodium_mg:    Optional[float] = None
    fiber_g:      Optional[float] = None

class Alternative(BaseModel):
    name:        str
    reason:      str
    health_score: Optional[int] = None


# ── Scan ─────────────────────────────────────────────────────────────────────

class ScanResponse(BaseModel):
    text:        str
    confidence:  float
    raw_text:    Optional[str] = None
    ingredients: List[str] = []
    thumbnail:   Optional[str] = None   # base64 JPEG


# ── Analyze ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    extracted_text:  str
    product_name:    Optional[str] = None
    user_profile:    Optional[dict] = None

class AnalyzeResponse(BaseModel):
    product_name:          Optional[str]
    ingredients:           List[str]
    flagged_ingredients:   List[IngredientFlag]
    allergens_detected:    List[str]
    health_score:          int = Field(ge=0, le=100)
    score_label:           ScoreLabel
    ai_summary:            str
    personalized_warnings: List[PersonalizedWarning]
    alternatives:          List[Alternative]
    nutrition:             Optional[NutritionInfo] = None
    total_ingredients:     int
    harmful_count:         int


# ── Compare ──────────────────────────────────────────────────────────────────

class CompareRequest(BaseModel):
    product_a: AnalyzeResponse
    product_b: AnalyzeResponse

class CompareResponse(BaseModel):
    winner:    str  # "A" | "B" | "tie"
    summary:   str
    product_a: AnalyzeResponse
    product_b: AnalyzeResponse


# ── Chat ─────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None  # Last scan result for context

class ChatResponse(BaseModel):
    reply:   str
    sources: Optional[List[str]] = None


# ── Profile ──────────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    name:               Optional[str] = None
    age:                Optional[int] = None
    gender:             Optional[str] = None
    dietary_preference: Optional[str] = None
    allergies:          List[str] = []
    health_conditions:  List[str] = []


# ── History ──────────────────────────────────────────────────────────────────

class ScanRecord(BaseModel):
    id:           str
    product_name: Optional[str]
    health_score: int
    score_label:  str
    created_at:   Any
    bookmarked:   bool = False
    thumbnail:    Optional[str] = None