from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from brain.prompts import COACH_SYSTEM_PROMPT


class GeminiClient:
    """Optional Gemini API client for personalized coaching."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()
        self.model = (model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")).strip()

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    def coaching_review(self, context: dict[str, Any], question: str = "") -> str:
        if not self.configured:
            return "Add a Gemini API key to generate a personalized AI coaching review."

        prompt = (
            f"{COACH_SYSTEM_PROMPT}\n\n"
            "Review this career-navigation result. Use the learner's recognized skills, "
            "dataset recommendations, specialization tracks, and internships. Give a "
            "specific priority order, a realistic 7-day plan, one dataset-backed project, "
            "and one internship application strategy. Do not repeat the roadmap mechanically.\n\n"
            f"Learner context:\n{json.dumps(context, indent=2)}"
        )
        if question.strip():
            prompt += f"\n\nLearner question:\n{question.strip()}"

        payload = json.dumps(
            {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.45,
                    "maxOutputTokens": 900,
                },
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent",
            data=payload,
            method="POST",
            headers={
                "x-goog-api-key": self.api_key,
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Gemini request failed ({exc.code}): {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Could not reach Gemini: {exc.reason}") from exc

        candidates = data.get("candidates", [])
        if not candidates:
            return "Gemini returned no candidates. Try a shorter prompt or a different model."
        parts = candidates[0].get("content", {}).get("parts", [])
        text = "\n".join(part.get("text", "") for part in parts).strip()
        return text or "Gemini returned an empty response."

    def status(self) -> str:
        if self.configured:
            return f"Gemini coach ready with `{self.model}`."
        return "Offline mode is active. Add a Gemini API key from Google AI Studio to unlock personalized AI coaching."
