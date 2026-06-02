def match_scholarships(interests: list[str], scholarships: list[dict]) -> list[dict]:
    wanted = set(interests)
    return [item for item in scholarships if wanted.intersection(item.get("topics", []))]
