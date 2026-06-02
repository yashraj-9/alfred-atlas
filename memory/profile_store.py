import json
from pathlib import Path

from core.config import MEMORY_DIR


class ProfileStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or MEMORY_DIR / "user_profile.json"

    def load(self) -> dict:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}

    def save(self, profile: dict) -> None:
        self.path.write_text(json.dumps(profile, indent=2), encoding="utf-8")
