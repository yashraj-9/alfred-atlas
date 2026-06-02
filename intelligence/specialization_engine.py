from __future__ import annotations

from typing import Any

from intelligence.knowledge_base import load_datasets, load_focus_areas
from intelligence.semantic_ranker import overlap_score, tokenize


def infer_focus_areas(profile: dict[str, Any], gap: dict[str, Any]) -> list[dict[str, Any]]:
    signals = [
        profile["target_role"],
        " ".join(profile.get("skills", [])),
        " ".join(profile.get("interests", [])),
        " ".join(gap.get("bonus_skills", [])),
    ]
    terms = set().union(*(tokenize(text) for text in signals))
    results = []

    for area in load_focus_areas():
        keyword_text = " ".join(area["keywords"] + area["prerequisites"])
        score = overlap_score(terms, keyword_text)
        matched = [keyword for keyword in area["keywords"] if keyword in profile.get("skills", []) or keyword in profile.get("interests", [])]
        missing_prereqs = [skill for skill in area["prerequisites"] if skill not in profile.get("skills", [])]
        if profile["target_role"] == "Data Scientist":
            score += 0.18
        if area["name"].lower() in " ".join(profile.get("interests", [])):
            score += 0.2
        if matched:
            score += min(len(matched) * 0.08, 0.24)
        results.append(
            {
                "name": area["name"],
                "why": area["why"],
                "score": round(score, 3),
                "matched_signals": matched,
                "missing_prerequisites": missing_prereqs,
                "starter_projects": area["starter_projects"],
            }
        )

    ranked = sorted(results, key=lambda item: item["score"], reverse=True)
    return [item for item in ranked if item["score"] > 0][:3]


def recommend_datasets(profile: dict[str, Any], focus_areas: list[dict[str, Any]]) -> list[dict[str, Any]]:
    terms = set().union(
        *(tokenize(text) for text in [profile["target_role"], " ".join(profile.get("skills", [])), " ".join(profile.get("interests", []))])
    )
    focus_names = {item["name"].lower() for item in focus_areas}
    top_focus = focus_areas[0]["name"].lower() if focus_areas else ""
    ranked = []
    for dataset in load_datasets():
        text = " ".join(
            [
                dataset["title"],
                dataset["domain"],
                dataset["task_type"],
                dataset["description"],
                " ".join(dataset.get("tags", [])),
            ]
        )
        score = overlap_score(terms, text)
        if dataset["domain"].lower() == top_focus:
            score += 0.45
        if dataset["domain"].lower() in focus_names:
            score += 0.25
        ranked.append({**dataset, "score": round(score, 3)})
    ranked.sort(key=lambda item: item["score"], reverse=True)
    return [item for item in ranked if item["score"] > 0][:4]
