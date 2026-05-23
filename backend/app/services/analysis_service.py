"""
Ingredient analysis service.
Runs the full analysis pipeline:
  1. Match ingredients against harm database
  2. Detect allergens
  3. Generate personalized warnings based on user profile
  4. Calculate health score (0-100)
  5. Suggest healthier alternatives
"""

import re
import logging
from typing import List, Optional

from app.data.ingredients_db import (
    HARMFUL_INGREDIENTS,
    ALLERGEN_KEYWORDS,
    CONDITION_TRIGGERS,
    ALTERNATIVES,
)

logger = logging.getLogger(__name__)


# ── 1. Ingredient matching ────────────────────────────────────────────────────

def match_harmful_ingredients(ingredients: List[str]) -> List[dict]:
    """
    Match a list of ingredient names against the harm database.
    Uses substring matching so partial names are caught
    (e.g. 'Sodium Benzoate (preservative)' still matches 'sodium benzoate').
    """
    flagged = []
    seen    = set()

    for ingredient in ingredients:
        normalized = ingredient.lower().strip()

        for key, data in HARMFUL_INGREDIENTS.items():
            if key in normalized and key not in seen:
                seen.add(key)
                flagged.append({
                    "ingredient":  ingredient,   # original casing
                    "risk":        data["risk"],
                    "severity":    data["severity"],
                    "category":    data.get("category", "Other"),
                    "explanation": data["explanation"],
                })

    return flagged


# ── 2. Allergen detection ─────────────────────────────────────────────────────

def detect_allergens(
    ingredients:       List[str],
    user_allergens:    List[str] = [],
) -> List[str]:
    """
    Detect allergens in the ingredient list.
    Returns a list of allergen names found.
    If user_allergens is provided, only checks those.
    Otherwise checks all known allergens.
    """
    found    = []
    all_text = " ".join(ingredients).lower()

    allergens_to_check = user_allergens if user_allergens else list(ALLERGEN_KEYWORDS.keys())

    for allergen in allergens_to_check:
        keywords = ALLERGEN_KEYWORDS.get(allergen, [])
        for kw in keywords:
            if kw in all_text:
                if allergen not in found:
                    found.append(allergen)
                break

    return found


# ── 3. Personalized warnings ──────────────────────────────────────────────────

def generate_personalized_warnings(
    ingredients:       List[str],
    health_conditions: List[str] = [],
) -> List[dict]:
    """
    Generate personalized warning messages based on the user's health conditions.
    """
    warnings   = []
    all_text   = " ".join(ingredients).lower()

    for condition in health_conditions:
        trigger = CONDITION_TRIGGERS.get(condition)
        if not trigger:
            continue

        for keyword in trigger["keywords"]:
            if keyword in all_text:
                warnings.append({
                    "condition": condition,
                    "message":   trigger["message"],
                    "severity":  _condition_severity(condition),
                })
                break  # one warning per condition

    return warnings


def _condition_severity(condition: str) -> str:
    critical = {"nut_allergy", "gluten_intolerance"}
    high     = {"diabetes", "heart_disease", "lactose_intolerance"}
    if condition in critical: return "High"
    if condition in high:     return "Medium"
    return "Low"


# ── 4. Health score ───────────────────────────────────────────────────────────

def calculate_health_score(
    ingredients:         List[str],
    flagged_ingredients: List[dict],
    allergens_detected:  List[str],
) -> int:
    """
    Calculate a health score from 0-100.

    Scoring logic:
      - Start at 100
      - Deduct points based on severity of flagged ingredients
      - Deduct points for allergens detected
      - Deduct points for total ingredient count (more additives = lower score)
      - Bonus points for short, clean ingredient lists
    """
    score = 100

    severity_deductions = {
        "Critical": 25,
        "High":     15,
        "Medium":    8,
        "Low":       3,
    }

    # Deduct for flagged ingredients
    for flag in flagged_ingredients:
        deduction = severity_deductions.get(flag["severity"], 5)
        score    -= deduction

    # Deduct for allergens
    score -= len(allergens_detected) * 5

    # Deduct for long ingredient lists (proxy for heavy processing)
    count = len(ingredients)
    if count > 20:   score -= 15
    elif count > 15: score -= 10
    elif count > 10: score -= 5

    # Bonus for very short, clean lists
    if count <= 5 and len(flagged_ingredients) == 0:
        score += 5

    return max(0, min(100, score))


def get_score_label(score: int) -> str:
    if score >= 80: return "Healthy"
    if score >= 50: return "Moderate"
    return "Risky"


# ── 5. Alternatives ───────────────────────────────────────────────────────────

def suggest_alternatives(flagged_ingredients: List[dict]) -> List[dict]:
    """
    Suggest healthier product alternatives based on what was flagged.
    """
    suggestions = []
    seen_types  = set()

    category_map = {
        "Added Sugar":        "high sugar",
        "Artificial Color":   "artificial colors",
        "Trans Fat":          "trans fat",
        "Preservative":       "preservatives",
    }

    for flag in flagged_ingredients:
        alt_key = category_map.get(flag.get("category"))
        if alt_key and alt_key not in seen_types:
            seen_types.add(alt_key)
            alts = ALTERNATIVES.get(alt_key, [])
            suggestions.extend(alts[:2])  # max 2 per category

    # Sodium check outside flagged list
    if "high sodium" not in seen_types:
        # rough check — if sodium-related items appear
        suggestions_len = len(suggestions)
        if suggestions_len == 0:
            suggestions.extend(ALTERNATIVES.get("preservatives", [])[:1])

    return suggestions[:5]  # cap at 5 total


# ── 6. AI summary (rule-based fallback) ───────────────────────────────────────

def generate_rule_based_summary(
    flagged_ingredients: List[dict],
    health_score:        int,
    total_ingredients:   int,
) -> str:
    """
    Generate a plain-language health summary without an AI API.
    Phase 5 will replace/enhance this with HuggingFace or Claude.
    """
    label = get_score_label(health_score)

    if health_score >= 80:
        base = f"This product has a clean ingredient list with {total_ingredients} ingredients and no major concerns detected."
    elif health_score >= 50:
        base = f"This product has a moderate health profile. Out of {total_ingredients} ingredients, {len(flagged_ingredients)} raised concerns."
    else:
        base = f"This product has a poor health profile. {len(flagged_ingredients)} out of {total_ingredients} ingredients are flagged as potentially harmful."

    # Add specific callouts for the worst offenders
    critical = [f for f in flagged_ingredients if f["severity"] in ("Critical", "High")]
    if critical:
        names = ", ".join(f["ingredient"] for f in critical[:3])
        base += f" Key concerns include: {names}."

    base += f" Overall health score: {health_score}/100 ({label})."
    return base


# ── Main pipeline ─────────────────────────────────────────────────────────────

def run_analysis(
    ingredients:       List[str],
    user_profile:      Optional[dict] = None,
) -> dict:
    """
    Run the full analysis pipeline and return a structured result dict.
    """
    profile            = user_profile or {}
    user_allergens     = profile.get("allergies", [])
    health_conditions  = profile.get("healthConditions", [])

    flagged      = match_harmful_ingredients(ingredients)
    allergens    = detect_allergens(ingredients, user_allergens)
    warnings     = generate_personalized_warnings(ingredients, health_conditions)
    score        = calculate_health_score(ingredients, flagged, allergens)
    label        = get_score_label(score)
    alternatives = suggest_alternatives(flagged)
    summary      = generate_rule_based_summary(flagged, score, len(ingredients))

    logger.info(
        f"Analysis complete — ingredients={len(ingredients)} "
        f"flagged={len(flagged)} score={score} label={label}"
    )

    return {
        "flagged_ingredients":   flagged,
        "allergens_detected":    allergens,
        "personalized_warnings": warnings,
        "health_score":          score,
        "score_label":           label,
        "alternatives":          alternatives,
        "ai_summary":            summary,
        "total_ingredients":     len(ingredients),
        "harmful_count":         len(flagged),
    }