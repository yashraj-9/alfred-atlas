from roadmap.milestone_generator import create_milestone
from roadmap.study_planner import weeks_per_skill


def generate_roadmap(missing_skills: list[str], weekly_hours: int) -> dict:
    duration = weeks_per_skill(weekly_hours)
    week = 1
    milestones = []
    for skill in missing_skills:
        milestone = create_milestone(skill, week, duration)
        milestones.append(milestone)
        week = milestone["end_week"] + 1
    milestones.append(
        {
            "weeks": f"{week}-{week + 1}",
            "title": "Portfolio Project",
            "action": "Build and publish one project that demonstrates your new skills.",
            "end_week": week + 1,
        }
    )
    return {"estimated_weeks": week + 1, "milestones": milestones}
