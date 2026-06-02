def recommend_courses(role: str, courses: list[dict]) -> list[dict]:
    return [course for course in courses if role in course.get("roles", [])][:3]
