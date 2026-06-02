def calculate_readiness(gaps: dict) -> int:
    total = gaps["total_core"]
    return round((len(gaps["matched_core"]) / total) * 100) if total else 100
