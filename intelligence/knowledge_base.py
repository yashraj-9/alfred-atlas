from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from core.config import DATA_DIR


@lru_cache(maxsize=1)
def load_focus_areas() -> list[dict[str, Any]]:
    return json.loads((DATA_DIR / "focus_areas.json").read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_datasets() -> list[dict[str, Any]]:
    return json.loads((DATA_DIR / "datasets.json").read_text(encoding="utf-8"))
