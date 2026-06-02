def analyze_resume(parsed_resume: dict) -> list[str]:
    tips = []
    if parsed_resume["word_count"] < 150:
        tips.append("Add measurable project, education, and experience details.")
    if "%" not in parsed_resume["text"]:
        tips.append("Add metrics where possible to show impact.")
    return tips or ["Resume has a useful level of detail. Review each bullet for clarity."]
