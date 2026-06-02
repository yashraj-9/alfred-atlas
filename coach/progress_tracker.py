from memory.progress_store import ProgressStore


class ProgressTracker:
    def __init__(self) -> None:
        self.store = ProgressStore()

    def mark_complete(self, milestone: str) -> dict:
        progress = self.store.load()
        completed = set(progress.get("completed_milestones", []))
        completed.add(milestone)
        progress["completed_milestones"] = sorted(completed)
        self.store.save(progress)
        return progress
