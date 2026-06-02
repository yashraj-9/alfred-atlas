def create_milestone(skill: str, start_week: int, duration: int) -> dict:
    end_week = start_week + duration - 1
    return {
        "weeks": f"{start_week}-{end_week}",
        "title": skill.title(),
        "action": f"Learn {skill}, practice it, and document one small result.",
        "end_week": end_week,
    }
