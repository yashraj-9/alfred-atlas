def match_internships(role: str, internships: list[dict]) -> list[dict]:
    return [item for item in internships if role in item.get("roles", [])]
