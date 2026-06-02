from __future__ import annotations

from typing import Any

from memory.memory_manager import MemoryManager
from profile.analyzer import analyze_profile
from roadmap.roadmap_generator import generate_roadmap
from roadmap.skill_gap import analyze_skill_gap, available_roles


class CareerNavigator:
    def __init__(self, memory_manager: MemoryManager | None = None) -> None:
        self.memory = memory_manager or MemoryManager()

    def roles(self) -> list[str]:
        return available_roles()

    def navigate(self, raw_profile: dict[str, Any]) -> dict[str, Any]:
        profile = analyze_profile(raw_profile)
        gap = analyze_skill_gap(profile["skills"], profile["target_role"], profile["skill_levels"])
        roadmap = generate_roadmap(profile, gap)
        result = {"profile": profile, "gap": gap, "roadmap": roadmap}
        self.memory.save_profile(profile)
        return result

    def load_profile(self) -> dict[str, Any]:
        return self.memory.load_profile()
