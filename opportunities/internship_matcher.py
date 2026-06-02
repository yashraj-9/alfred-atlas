def match_internships(profile: dict, focus_areas: list[dict], internships: list[dict]) -> list[dict]:
    role = profile["target_role"]
    skills = set(profile.get("skills", []))
    focus_names = {area["name"] for area in focus_areas}
    matches = []

    for item in internships:
        if role not in item.get("roles", []):
            continue
        required = set(item.get("required_skills", []))
        nice_to_have = set(item.get("nice_to_have", []))
        item_focus = set(item.get("focus_areas", []))
        score = len(skills.intersection(required)) * 3
        score += len(skills.intersection(nice_to_have))
        score += len(focus_names.intersection(item_focus)) * 2
        missing = sorted(required.difference(skills))
        fit = "Strong fit" if not missing else "Build-ready"
        matches.append({**item, "score": score, "missing_required": missing, "fit": fit})

    return sorted(matches, key=lambda item: item["score"], reverse=True)
