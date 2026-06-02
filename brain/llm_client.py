from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from brain.prompts import COACH_SYSTEM_PROMPT


class LLMClient:
    """Optional OpenAI Responses API client for personalized coaching."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = (api_key or os.getenv("OPENAI_API_KEY", "")).strip()
        self.model = (model or os.getenv("OPENAI_MODEL", "gpt-5-mini")).strip()

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def coaching_review(self, context: dict[str, Any], question: str = "") -> str:
        if not self.is_configured:
            return "Add an OpenAI API key to generate a personalized AI coaching review."

        prompt = (
            "Review this career-navigation result. Be specific to the learner. "
            "Identify the best immediate priority, correct weak assumptions, suggest "
            "a realistic 7-day plan, and give one portfolio idea. Do not repeat the "
            "roadmap mechanically. Keep the response concise and practical.\n\n"
            f"Learner context:\n{json.dumps(context, indent=2)}"
        )
        if question.strip():
            prompt += f"\n\nLearner question:\n{question.strip()}"

        payload = json.dumps(
            {
                "model": self.model,
                "instructions": COACH_SYSTEM_PROMPT,
                "input": prompt,
                "max_output_tokens": 700,
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=payload,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"OpenAI request failed ({exc.code}): {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Could not reach OpenAI: {exc.reason}") from exc

        text = data.get("output_text")
        if text:
            return text
        parts = []
        for item in data.get("output", []):
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    parts.append(content.get("text", ""))
        return "\n".join(parts).strip() or "The AI coach returned an empty response."

    def status(self) -> str:
        if self.is_configured:
            return f"AI coach ready with `{self.model}`."
        return "Offline mode is active. Add an OpenAI API key to unlock personalized AI coaching."
