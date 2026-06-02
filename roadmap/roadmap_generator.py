from __future__ import annotations

from typing import Any


SKILL_PLAYBOOK: dict[str, dict[str, Any]] = {
    "python": {
        "outcome": "Write clean Python scripts that load, transform, and validate data.",
        "tasks": ["Practice functions, collections, and file handling", "Complete 15 small exercises", "Build one reusable data-cleaning script"],
        "proof": "A GitHub repository containing the script, sample input, output, and README.",
    },
    "sql": {
        "outcome": "Query a relational dataset confidently and explain the result.",
        "tasks": ["Practice SELECT, WHERE, GROUP BY, and JOIN", "Write 20 analysis queries", "Answer five business questions from one dataset"],
        "proof": "A SQL file plus a short markdown report with findings.",
    },
    "statistics": {
        "outcome": "Use statistics to support decisions instead of only calculating formulas.",
        "tasks": ["Review distributions, sampling, and confidence intervals", "Compare correlation with causation", "Explain one A/B-test style result"],
        "proof": "A notebook that explains a small dataset with charts and plain-language conclusions.",
    },
    "machine learning": {
        "outcome": "Train, evaluate, and explain a baseline machine-learning model.",
        "tasks": ["Split data into train and test sets", "Build a baseline model", "Compare metrics and describe one limitation"],
        "proof": "A notebook with a baseline model, evaluation table, and improvement notes.",
    },
    "natural language processing": {
        "outcome": "Turn raw text into a model-ready feature pipeline and a first text classifier.",
        "tasks": ["Clean and tokenize text data", "Build a baseline text classifier", "Compare at least two text-representation approaches"],
        "proof": "A notebook that explains preprocessing decisions, metrics, and error examples.",
    },
    "deep learning": {
        "outcome": "Train and explain a small neural-network baseline without hiding the tradeoffs.",
        "tasks": ["Use a framework such as PyTorch or TensorFlow", "Train a small neural model", "Compare the neural baseline with a simpler classical model"],
        "proof": "A notebook or repo with training results, learning curves, and model limitations.",
    },
    "data visualization": {
        "outcome": "Choose charts that make a useful insight obvious.",
        "tasks": ["Create five chart types", "Remove clutter and improve labels", "Build a one-page insight dashboard"],
        "proof": "A dashboard screenshot and a README explaining three insights.",
    },
    "excel": {
        "outcome": "Analyze a structured dataset efficiently in a spreadsheet.",
        "tasks": ["Use formulas and lookup functions", "Build a pivot-table summary", "Create a small dashboard"],
        "proof": "A documented workbook with an analysis tab and dashboard tab.",
    },
    "pandas": {
        "outcome": "Manipulate tabular data quickly and reproducibly.",
        "tasks": ["Practice filtering, grouping, merging, and missing-value handling", "Rebuild one analysis end to end in pandas", "Document the transformation pipeline"],
        "proof": "A notebook showing raw data, cleaned data, and transformation steps.",
    },
    "scikit-learn": {
        "outcome": "Use scikit-learn to build repeatable modeling pipelines.",
        "tasks": ["Fit baseline estimators", "Create a preprocessing and modeling pipeline", "Evaluate with appropriate metrics"],
        "proof": "A notebook with a reusable pipeline and metric comparison table.",
    },
    "git": {
        "outcome": "Use Git to show steady, readable progress on a project.",
        "tasks": ["Practice add, commit, status, and branch", "Write meaningful commit messages", "Publish a repository with a clear README"],
        "proof": "A public repository with several focused commits.",
    },
    "html": {
        "outcome": "Build a semantic and accessible page structure.",
        "tasks": ["Use semantic layout elements", "Create an accessible form", "Check headings and keyboard navigation"],
        "proof": "A deployed single-page site with a short accessibility checklist.",
    },
    "css": {
        "outcome": "Create responsive layouts without fragile styling.",
        "tasks": ["Practice Flexbox and Grid", "Add responsive breakpoints", "Create reusable component styles"],
        "proof": "A responsive page that works on mobile and desktop.",
    },
    "javascript": {
        "outcome": "Build a small interactive browser application.",
        "tasks": ["Practice arrays, objects, and functions", "Handle form and click events", "Fetch and display API data"],
        "proof": "A deployed interactive app with source code.",
    },
    "react": {
        "outcome": "Build a component-based interface with state and reusable UI pieces.",
        "tasks": ["Create reusable components", "Manage local state", "Render data from an API or local dataset"],
        "proof": "A deployed React project with screenshots and setup instructions.",
    },
}

ROLE_CAPSTONES = {
    "Data Analyst": "Analyze a public dataset and publish an insight dashboard with a short business-style report.",
    "Data Scientist": "Build an end-to-end prediction project: define the question, prepare data, compare a baseline model, evaluate it, and document limitations.",
    "Frontend Developer": "Build and deploy a responsive application with accessible components and a polished README.",
    "Backend Developer": "Build a documented REST API with validation, persistence, tests, and a deployment note.",
    "Cloud Engineer": "Deploy a containerized service and document the architecture, monitoring checks, and recovery steps.",
    "Cybersecurity Analyst": "Create a small incident-analysis case study with a timeline, findings, and remediation checklist.",
    "UI/UX Designer": "Publish a UX case study covering research, wireframes, prototype decisions, and usability findings.",
}


def _weeks_for_skill(weekly_hours: int) -> int:
    if weekly_hours >= 12:
        return 1
    if weekly_hours >= 6:
        return 2
    return 3


def _playbook(skill: str) -> dict[str, Any]:
    return SKILL_PLAYBOOK.get(
        skill,
        {
            "outcome": f"Build a practical foundation in {skill}.",
            "tasks": [f"Learn the core concepts of {skill}", "Complete focused practice exercises", "Apply the skill in one small artifact"],
            "proof": f"A documented mini-project demonstrating {skill}.",
        },
    )


def generate_roadmap(profile: dict[str, Any], gap: dict[str, Any], focus_areas: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    priorities = gap["priority_skills"]
    weekly_hours = profile["weekly_hours"]
    weeks_per_skill = _weeks_for_skill(weekly_hours)
    phases: list[dict[str, Any]] = []
    current_week = 1
    focus_label = focus_areas[0]["name"] if focus_areas else gap["target_role"]

    for skill in priorities:
        guide = _playbook(skill)
        end_week = current_week + weeks_per_skill - 1
        phases.append(
            {
                "weeks": f"{current_week}-{end_week}",
                "skill": skill.title(),
                "status": "Strengthen your foundation" if skill in gap["developing_skills"] else "Build this missing skill",
                "outcome": guide["outcome"],
                "tasks": guide["tasks"],
                "proof": guide["proof"],
            }
        )
        current_week = end_week + 1

    portfolio_weeks = 2 if weekly_hours >= 6 else 3
    end_week = current_week + portfolio_weeks - 1
    phases.append(
        {
            "weeks": f"{current_week}-{end_week}",
            "skill": "Portfolio Capstone",
            "status": "Turn learning into evidence",
            "outcome": ROLE_CAPSTONES[gap["target_role"]],
            "tasks": [
                f"Choose one {focus_label} problem that fits your current level",
                "Build the smallest complete version",
                "Publish the work with a clear README, results, and reflection",
            ],
            "proof": "A shareable portfolio link that a recruiter or mentor can review.",
        }
    )

    return {
        "estimated_weeks": end_week,
        "weekly_hours": weekly_hours,
        "phases": phases,
        "next_step": phases[0]["tasks"][0],
    }
