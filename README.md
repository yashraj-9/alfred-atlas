# Alfred Atlas

Alfred Atlas is an offline-first career navigator. It compares your current
skills with a target role, calculates a readiness score, creates a weekly
roadmap, and recommends projects and courses.

## Run locally

```powershell
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

No API key is required for the starter version. Add `GEMINI_API_KEY` later if
you connect the optional client in `llm/gemini_client.py`.

## Current features

- Career-role database loaded from JSON
- Skill-gap analysis and readiness score
- Weekly milestones based on available study time
- Local profile and progress storage
- Project and course recommendations
- Streamlit dashboard

## Planned modules

The repository includes extension points for internships, scholarships, jobs,
resume checks, GitHub portfolio analysis, coaching, and Gemini-powered advice.
