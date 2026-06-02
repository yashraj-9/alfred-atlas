def match_jobs(role: str, jobs: list[dict]) -> list[dict]:
    return [item for item in jobs if item.get("role") == role]
