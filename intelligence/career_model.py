from __future__ import annotations

from typing import Any


def build_model_insights(profile: dict[str, Any], gap: dict[str, Any], focus_areas: list[dict[str, Any]], datasets: list[dict[str, Any]]) -> dict[str, Any]:
    top_focus = focus_areas[0]["name"] if focus_areas else profile["target_role"]
    top_dataset = datasets[0]["title"] if datasets else "a small public dataset"
    blockers = gap["developing_skills"] + gap["missing_skills"]
    confidence = min(95, 45 + len(profile.get("skills", [])) * 8 + len(focus_areas) * 6)

    return {
        "recommended_focus": top_focus,
        "confidence": confidence,
        "next_capability": blockers[0] if blockers else "portfolio depth",
        "dataset_start": top_dataset,
        "reason": (
            f"Alfred matched your role, skills, interests, and missing prerequisites. "
            f"The strongest path is {top_focus}, starting with {top_dataset}."
        ),
    }
