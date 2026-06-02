from career.skill_analyzer import normalize_skills


def detect_gaps(skills: str | list[str], role: dict) -> dict:
    owned = set(normalize_skills(skills))
    core = role["core_skills"]
    bonus = role.get("bonus_skills", [])
    return {
        "matched_core": [skill for skill in core if skill in owned],
        "missing_core": [skill for skill in core if skill not in owned],
        "bonus_to_build": [skill for skill in bonus if skill not in owned],
        "total_core": len(core),
    }
