def weeks_per_skill(weekly_hours: int) -> int:
    if weekly_hours >= 12:
        return 1
    if weekly_hours >= 6:
        return 2
    return 3
