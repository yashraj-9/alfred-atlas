from github.repo_scorer import score_repository


def analyze_repositories(repositories: list[dict]) -> list[dict]:
    return [{**repo, "score": score_repository(repo)} for repo in repositories]
