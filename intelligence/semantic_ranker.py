from __future__ import annotations

import re
from typing import Iterable


def tokenize(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9\+\-]+", text.lower()) if len(token) > 1}


def overlap_score(query_terms: Iterable[str], document: str) -> float:
    query = set(query_terms)
    if not query:
        return 0.0
    document_terms = tokenize(document)
    if not document_terms:
        return 0.0
    shared = query.intersection(document_terms)
    return len(shared) / len(query.union(document_terms))
