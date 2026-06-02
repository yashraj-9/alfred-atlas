from __future__ import annotations

import re
from typing import Any


SKILL_ALIASES: dict[str, list[str]] = {
    "accessibility": ["a11y"],
    "apis": ["api", "rest api", "rest apis"],
    "aws": ["amazon web services"],
    "ci/cd": ["cicd", "continuous integration"],
    "cloud fundamentals": ["cloud", "cloud basics"],
    "css": [],
    "data visualization": ["data viz", "visualization", "visualisation"],
    "databases": ["database", "dbms"],
    "deep learning": ["dl", "neural networks", "neural network", "pytorch", "tensorflow"],
    "design systems": [],
    "docker": ["containers", "containerization"],
    "excel": ["ms excel", "microsoft excel"],
    "fastapi": ["fast api"],
    "figma": [],
    "git": ["github"],
    "html": ["html5"],
    "incident response": [],
    "javascript": ["js"],
    "linux": [],
    "machine learning": ["ml", "basic ml"],
    "natural language processing": ["nlp", "text mining", "text classification", "transformers"],
    "networking": ["computer networks"],
    "pandas": [],
    "power bi": ["powerbi"],
    "prototyping": ["prototype"],
    "python": ["python programming"],
    "react": ["reactjs", "react.js"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "security fundamentals": ["cybersecurity", "cyber security"],
    "siem": [],
    "sql": ["mysql", "postgresql", "postgres"],
    "statistics": ["stats"],
    "storytelling": ["data storytelling"],
    "tableau": [],
    "terraform": [],
    "testing": ["unit testing", "tests"],
    "threat modeling": ["threat modelling"],
    "typescript": ["ts"],
    "usability testing": [],
    "user research": ["ux research"],
    "visual design": ["ui design"],
    "wireframing": ["wireframes"],
}

BEGINNER_MARKERS = ("basic", "beginner", "learning", "familiar", "little", "some")
ADVANCED_MARKERS = ("advanced", "strong", "expert", "professional", "proficient")


def _contains_phrase(text: str, phrase: str) -> bool:
    return bool(re.search(rf"(?<!\w){re.escape(phrase)}(?!\w)", text))


def _level_near_phrase(text: str, phrase: str) -> str:
    match = re.search(rf"(?<!\w){re.escape(phrase)}(?!\w)", text)
    if not match:
        return "intermediate"
    nearby = text[max(0, match.start() - 18) : match.end() + 4]
    if any(marker in nearby for marker in BEGINNER_MARKERS):
        return "beginner"
    if any(marker in nearby for marker in ADVANCED_MARKERS):
        return "advanced"
    return "intermediate"


def parse_skills(value: str | list[str] | None) -> dict[str, Any]:
    text = " ".join(value) if isinstance(value, list) else str(value or "")
    text = text.lower().replace("&", " and ")
    found: dict[str, str] = {}

    for canonical, aliases in SKILL_ALIASES.items():
        candidates = sorted([canonical, *aliases], key=len, reverse=True)
        for phrase in candidates:
            if _contains_phrase(text, phrase):
                found[canonical] = _level_near_phrase(text, phrase)
                break

    return {
        "skills": sorted(found),
        "skill_levels": found,
        "raw_skills": text.strip(),
    }


def clean_list(value: str | list[str] | None) -> list[str]:
    if not value:
        return []
    items = re.split(r",|\band\b|;", value, flags=re.IGNORECASE) if isinstance(value, str) else value
    return sorted({item.strip().lower() for item in items if item.strip()})
