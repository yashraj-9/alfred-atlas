from coach.motivation_engine import motivation_message


def coach_summary(readiness: int, next_action: str) -> str:
    return f"{motivation_message(readiness)} Next action: {next_action}"
