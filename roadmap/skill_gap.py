from __future__ import annotations

from typing import Any


ROLE_LIBRARY: dict[str, dict[str, list[str]]] = {
    "Data Analyst": {
        "core": ["excel", "sql", "python", "statistics", "data visualization"],
        "bonus": ["power bi", "tableau", "storytelling"],
    },
    "Data Scientist": {
        "core": ["python", "sql", "statistics", "machine learning", "data visualization"],
        "bonus": ["pandas", "scikit-learn", "deep learning"],
    },
    "Frontend Developer": {
        "core": ["html", "css", "javascript", "git", "react"],
        "bonus": ["typescript", "accessibility", "testing"],
    },
    "Backend Developer": {
        "core": ["python", "sql", "git", "apis", "databases"],
        "bonus": ["fastapi", "docker", "testing"],
    },
    "Cloud Engineer": {
        "core": ["linux", "networking", "git", "cloud fundamentals", "docker"],
        "bonus": ["aws", "terraform", "ci/cd"],
    },
    "Cybersecurity Analyst": {
        "core": ["networking", "linux", "security fundamentals", "python", "incident response"],
        "bonus": ["siem", "cloud security", "threat modeling"],
    },
    "UI/UX Designer": {
        "core": ["figma", "user research", "wireframing", "prototyping", "visual design"],
        "bonus": ["accessibility", "design systems", "usability testing"],
    },
}


def available_roles() -> list[str]:
    return sorted(ROLE_LIBRARY)


def analyze_skill_gap(
    current_skills: list[str],
    target_role: str,
    skill_levels: dict[str, str] | None = None,
) -> dict[str, Any]:
    role = ROLE_LIBRARY.get(target_role)
    if role is None:
        raise ValueError(f"Unknown target role: {target_role}")

    owned = set(current_skills)
    levels = skill_levels or {}
    core = role["core"]
    missing = [skill for skill in core if skill not in owned]
    matched = [skill for skill in core if skill in owned]
    developing = [skill for skill in matched if levels.get(skill) == "beginner"]
    weighted_matches = sum(0.5 if skill in developing else 1 for skill in matched)
    readiness = round((weighted_matches / len(core)) * 100)
    return {
        "target_role": target_role,
        "matched_skills": matched,
        "developing_skills": developing,
        "missing_skills": missing,
        "priority_skills": [skill for skill in core if skill in developing or skill in missing],
        "bonus_skills": [skill for skill in role["bonus"] if skill not in owned],
        "readiness_score": readiness,
    }
