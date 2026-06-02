from __future__ import annotations

from typing import Any

from profile.skill_parser import clean_list, parse_skills


def analyze_profile(raw_profile: dict[str, Any]) -> dict[str, Any]:
    parsed_skills = parse_skills(raw_profile.get("skills"))
    return {
        "name": str(raw_profile.get("name", "")).strip() or "Explorer",
        "current_status": str(raw_profile.get("current_status", "")).strip(),
        "target_role": str(raw_profile.get("target_role", "")).strip(),
        "skills": parsed_skills["skills"],
        "skill_levels": parsed_skills["skill_levels"],
        "raw_skills": parsed_skills["raw_skills"],
        "interests": clean_list(raw_profile.get("interests")),
        "weekly_hours": max(1, int(raw_profile.get("weekly_hours", 5))),
    }
