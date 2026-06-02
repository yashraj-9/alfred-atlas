from opportunities.internship_matcher import match_internships


def recommend_internships(profile: dict, focus_areas: list[dict], internships: list[dict]) -> list[dict]:
    return match_internships(profile, focus_areas, internships)[:7]
