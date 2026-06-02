import json

from core.config import DATA_DIR


class RoleDatabase:
    def __init__(self) -> None:
        self.roles = json.loads((DATA_DIR / "roles.json").read_text(encoding="utf-8"))

    def names(self) -> list[str]:
        return sorted(self.roles)

    def get(self, name: str) -> dict:
        if name not in self.roles:
            raise ValueError(f"Unknown role: {name}")
        return self.roles[name]
