def recommend_projects(role: str, projects: list[dict]) -> list[dict]:
    return [project for project in projects if role in project.get("roles", [])][:3]
