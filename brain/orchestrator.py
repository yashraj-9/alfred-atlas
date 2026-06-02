from __future__ import annotations

from typing import Any

from intelligence.career_model import build_model_insights
from intelligence.specialization_engine import infer_focus_areas, recommend_datasets
from memory.memory_manager import MemoryManager
from profile.analyzer import analyze_profile
from recommender.recommendation_engine import RecommendationEngine
from roadmap.roadmap_generator import generate_roadmap
from roadmap.skill_gap import analyze_skill_gap, available_roles


class CareerNavigator:
    def __init__(self, memory_manager: MemoryManager | None = None) -> None:
        self.memory = memory_manager or MemoryManager()
        self.recommender = RecommendationEngine()

    def roles(self) -> list[str]:
        return available_roles()

    def navigate(self, raw_profile: dict[str, Any]) -> dict[str, Any]:
        profile = analyze_profile(raw_profile)
        gap = analyze_skill_gap(profile["skills"], profile["target_role"], profile["skill_levels"])
        focus_areas = infer_focus_areas(profile, gap)
        roadmap = generate_roadmap(profile, gap, focus_areas)
        recommendations = self.recommender.for_profile(profile, gap, focus_areas)
        datasets = recommend_datasets(profile, focus_areas)
        model_insights = build_model_insights(profile, gap, focus_areas, datasets)
        result = {
            "profile": profile,
            "gap": gap,
            "focus_areas": focus_areas,
            "roadmap": roadmap,
            "recommendations": recommendations,
            "datasets": datasets,
            "model_insights": model_insights,
        }
        self.memory.save_profile(profile)
        return result

    def load_profile(self) -> dict[str, Any]:
        return self.memory.load_profile()
