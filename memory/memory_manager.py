from __future__ import annotations

import json
from pathlib import Path
from typing import Any


DEFAULT_PROFILE_PATH = Path(__file__).with_name("user_profile.json")


class MemoryManager:
    def __init__(self, profile_path: Path | None = None) -> None:
        self.profile_path = profile_path or DEFAULT_PROFILE_PATH

    def load_profile(self) -> dict[str, Any]:
        if not self.profile_path.exists():
            return {}
        try:
            return json.loads(self.profile_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}

    def save_profile(self, profile: dict[str, Any]) -> None:
        self.profile_path.parent.mkdir(parents=True, exist_ok=True)
        self.profile_path.write_text(
            json.dumps(profile, indent=2, ensure_ascii=True),
            encoding="utf-8",
        )
