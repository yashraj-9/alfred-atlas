from __future__ import annotations

from datetime import date


def _parse_date(value: str) -> date:
    return date.fromisoformat(value)


def _deadline_status(item: dict, today: date) -> tuple[str, int]:
    start = _parse_date(item["application_start"])
    deadline = _parse_date(item["application_deadline"])
    if start <= today <= deadline:
        return "Open now", 30
    if today < start:
        days = (start - today).days
        return f"Opens in {days} days", 20
    days_late = (today - deadline).days
    if days_late <= 45:
        return f"Closed {days_late} days ago", 5
    return "Closed for this cycle", -10


def match_internships(profile: dict, focus_areas: list[dict], internships: list[dict]) -> list[dict]:
    role = profile["target_role"]
    skills = set(profile.get("skills", []))
    focus_names = {area["name"] for area in focus_areas}
    matches = []
    today = date.today()

    for item in internships:
        if role not in item.get("roles", []):
            continue
        required = set(item.get("required_skills", []))
        nice_to_have = set(item.get("nice_to_have", []))
        item_focus = set(item.get("focus_areas", []))
        status, timing_score = _deadline_status(item, today)
        score = len(skills.intersection(required)) * 3
        score += len(skills.intersection(nice_to_have))
        score += len(focus_names.intersection(item_focus)) * 2
        score += timing_score
        missing = sorted(required.difference(skills))
        fit = "Strong fit" if not missing else "Build-ready"
        matches.append({**item, "score": score, "missing_required": missing, "fit": fit, "status": status})

    return sorted(matches, key=lambda item: item["score"], reverse=True)
