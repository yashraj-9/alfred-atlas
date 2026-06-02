import json

from core.config import DATA_DIR
from recommender.course_recommender import recommend_courses
from recommender.internship_recommender import recommend_internships
from recommender.project_recommender import recommend_projects


class RecommendationEngine:
    def _load(self, name: str) -> list[dict]:
        return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))

    def for_role(self, role: str) -> dict:
        return {
            "projects": recommend_projects(role, self._load("projects.json")),
            "courses": recommend_courses(role, self._load("courses.json")),
            "internships": recommend_internships(role, self._load("internships.json")),
        }
