def score_repository(repo: dict) -> int:
    score = 0
    score += 30 if repo.get("has_readme") else 0
    score += 25 if repo.get("has_description") else 0
    score += 25 if repo.get("has_topics") else 0
    score += 20 if repo.get("recently_updated") else 0
    return score
