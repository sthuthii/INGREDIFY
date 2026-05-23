"""
AI service using the Anthropic API.
Generates plain-language health summaries and powers the nutrition chatbot.
Falls back to rule-based summary if API is unavailable.
"""

import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
MODEL             = "claude-sonnet-4-20250514"


async def _call_claude(system: str, user: str, max_tokens: int = 500) -> Optional[str]:
    """
    Make a single call to the Anthropic API.
    Returns the text response or None if the call fails.
    """
    if not ANTHROPIC_API_KEY:
        logger.warning("ANTHROPIC_API_KEY not set — skipping AI call.")
        return None

    headers = {
        "x-api-key":         ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
    }

    body = {
        "model":      MODEL,
        "max_tokens": max_tokens,
        "system":     system,
        "messages":   [{"role": "user", "content": user}],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(ANTHROPIC_API_URL, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"].strip()
    except httpx.TimeoutException:
        logger.error("Anthropic API timeout.")
        return None
    except Exception as e:
        logger.error(f"Anthropic API error: {e}")
        return None


# ── Health summary ────────────────────────────────────────────────────────────

SUMMARY_SYSTEM = """You are a friendly, knowledgeable nutrition expert.
Your job is to explain food label analysis results in plain, clear language
that anyone can understand — no jargon.

Rules:
- Keep responses to 3-4 sentences maximum.
- Be honest but not alarmist.
- Always mention the health score.
- If there are serious concerns, clearly state them.
- End with one practical recommendation.
- Never use bullet points or markdown — plain prose only.
"""


async def generate_ai_summary(
    ingredients:         list[str],
    flagged_ingredients: list[dict],
    health_score:        int,
    score_label:         str,
    personalized_warnings: list[dict],
) -> str:
    """
    Generate a plain-language AI health summary using Claude.
    Falls back to rule-based summary if API is unavailable.
    """
    # Build context for Claude
    flagged_names = [f["ingredient"] for f in flagged_ingredients]
    critical      = [f for f in flagged_ingredients if f["severity"] in ("Critical", "High")]
    warnings_text = "; ".join([w["message"] for w in personalized_warnings]) if personalized_warnings else "none"

    user_prompt = f"""
Analyze this food product and write a short health summary.

Health score: {health_score}/100 ({score_label})
Total ingredients: {len(ingredients)}
Flagged ingredients: {", ".join(flagged_names) if flagged_names else "none"}
Critical/High severity items: {", ".join([f["ingredient"] for f in critical]) if critical else "none"}
Personalized warnings: {warnings_text}
Top ingredients: {", ".join(ingredients[:8])}

Write a 3-4 sentence plain-language summary.
"""

    result = await _call_claude(SUMMARY_SYSTEM, user_prompt, max_tokens=300)

    if result:
        return result

    # Rule-based fallback
    from app.services.analysis_service import generate_rule_based_summary
    return generate_rule_based_summary(flagged_ingredients, health_score, len(ingredients))


# ── Nutrition chatbot ─────────────────────────────────────────────────────────

CHAT_SYSTEM = """You are Ingredify's AI nutrition assistant — friendly, accurate, and concise.
You help users understand food ingredients, nutrition labels, and make healthier choices.

Rules:
- Keep answers to 2-4 sentences unless the question genuinely needs more detail.
- Use plain language — no jargon.
- If asked about a specific ingredient, explain what it is and whether it's a concern.
- If asked about a health condition and food, give practical, evidence-based advice.
- Never diagnose or replace medical advice — suggest consulting a doctor for medical decisions.
- If you don't know something, say so honestly.
- Never use markdown formatting — plain prose only.
"""


async def chat_with_assistant(
    message: str,
    context: Optional[dict] = None,
) -> str:
    """
    Answer a nutrition/ingredient question using Claude.
    Context can include the last scan result for reference.
    """
    # Build context string if scan result is available
    context_text = ""
    if context:
        product = context.get("product_name", "the scanned product")
        score   = context.get("health_score")
        flagged = context.get("flagged_ingredients", [])
        if score is not None:
            context_text = (
                f"\n\nContext — the user recently scanned '{product}' "
                f"which scored {score}/100. "
                f"Flagged ingredients: {', '.join([f['ingredient'] for f in flagged[:5]]) if flagged else 'none'}."
            )

    user_prompt = f"{message}{context_text}"

    result = await _call_claude(CHAT_SYSTEM, user_prompt, max_tokens=400)

    if result:
        return result

    # Fallback response if API is unavailable
    return (
        "I'm having trouble connecting to the AI service right now. "
        "Please try again in a moment. In the meantime, you can check "
        "the ingredient analysis results for detailed information about this product."
    )