from career.gap_detector import detect_gaps
from career.readiness_score import calculate_readiness
from career.role_database import RoleDatabase
from memory.memory_manager import MemoryManager
from recommender.recommendation_engine import RecommendationEngine
from roadmap.roadmap_generator import generate_roadmap


class CareerNavigator:
    def __init__(self) -> None:
        self.roles = RoleDatabase()
        self.memory = MemoryManager()
        self.recommender = RecommendationEngine()

    def available_roles(self) -> list[str]:
        return self.roles.names()

    def navigate(self, profile: dict) -> dict:
        role = self.roles.get(profile["target_role"])
        gaps = detect_gaps(profile.get("skills", []), role)
        readiness = calculate_readiness(gaps)
        roadmap = generate_roadmap(gaps["missing_core"], profile["weekly_hours"])
        recommendations = self.recommender.for_role(profile["target_role"])
        self.memory.save_profile(profile)
        return {
            "profile": profile,
            "role": role,
            "gaps": gaps,
            "readiness": readiness,
            "roadmap": roadmap,
            "recommendations": recommendations,
        }
