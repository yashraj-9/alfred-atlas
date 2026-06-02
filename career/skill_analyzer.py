def normalize_skills(skills: str | list[str]) -> list[str]:
    values = skills.split(",") if isinstance(skills, str) else skills
    return sorted({value.strip().lower() for value in values if value.strip()})
