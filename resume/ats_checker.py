def ats_check(text: str) -> list[str]:
    warnings = []
    if not text.strip():
        warnings.append("Add resume text before running the ATS check.")
    if "skills" not in text.lower():
        warnings.append("Consider adding a Skills section.")
    return warnings
