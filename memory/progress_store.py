import json
from pathlib import Path

from core.config import MEMORY_DIR


class ProgressStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or MEMORY_DIR / "progress.json"

    def load(self) -> dict:
        if not self.path.exists():
            return {"completed_milestones": []}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {"completed_milestones": []}

    def save(self, progress: dict) -> None:
        self.path.write_text(json.dumps(progress, indent=2), encoding="utf-8")
