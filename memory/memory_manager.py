from memory.profile_store import ProfileStore
from memory.progress_store import ProgressStore


class MemoryManager:
    def __init__(self) -> None:
        self.profiles = ProfileStore()
        self.progress = ProgressStore()

    def load_profile(self) -> dict:
        return self.profiles.load()

    def save_profile(self, profile: dict) -> None:
        self.profiles.save(profile)
