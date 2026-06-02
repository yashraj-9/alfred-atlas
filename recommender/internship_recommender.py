from opportunities.internship_matcher import match_internships


def recommend_internships(role: str, internships: list[dict]) -> list[dict]:
    return match_internships(role, internships)[:3]
