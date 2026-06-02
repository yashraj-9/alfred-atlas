import json

from core.config import DATA_DIR
from recommender.course_recommender import recommend_courses
from recommender.internship_recommender import recommend_internships
from recommender.project_recommender import recommend_projects


class RecommendationEngine:
    def _load(self, name: str) -> list[dict]:
        return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))

    def for_profile(self, profile: dict, gap: dict, focus_areas: list[dict]) -> dict:
        role = profile["target_role"]
        specialization_projects = []
        for area in focus_areas:
            for title in area["starter_projects"]:
                specialization_projects.append(
                    {
                        "title": title,
                        "description": f"{area['name']} path: {area['why']}",
                    }
                )
        return {
            "projects": recommend_projects(role, self._load("projects.json")),
            "courses": recommend_courses(role, self._load("courses.json")),
            "internships": recommend_internships(profile, focus_areas, self._load("internships.json")),
            "specialization_projects": specialization_projects[:4],
            "bonus_skills": gap["bonus_skills"][:3],
        }
