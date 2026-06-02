def parse_resume_text(text: str) -> dict:
    words = text.split()
    return {"text": text, "word_count": len(words)}
