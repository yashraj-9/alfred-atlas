def motivation_message(readiness: int) -> str:
    if readiness >= 80:
        return "You have the foundation. Build proof through projects and applications."
    if readiness >= 40:
        return "You are making progress. Keep the next milestone small and consistent."
    return "Start with one skill and one repeatable weekly habit."
