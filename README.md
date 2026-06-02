# Alfred Atlas

Alfred Atlas is an offline-first career navigator. It takes a target role,
compares it with a user's current skills, calculates a readiness score, and
creates a phased learning roadmap.

## Features

- Profile intake with local JSON persistence
- Built-in career library for common technology and design roles
- Skill-gap report and readiness score
- Natural-language skill recognition, including aliases such as `ml`, `js`, and `github`
- Local specialization inference for Machine Learning, NLP, and Deep Learning
- Dataset recommendations matched to your role, skills, and interests
- Dataset-backed internship matching with real programs such as GSoC, Outreachy, LFX Mentorship, MLH Fellowship, CERN openlab, Mitacs Globalink, and MeitY Digital India
- Weekly roadmap with specific outcomes, practice tasks, and portfolio evidence
- Streamlit dashboard
- Optional Gemini-powered personalized coaching review

## Run locally

```powershell
cd alfred-atlas
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

The app runs without an API key. Profiles are saved locally in
`memory/user_profile.json`.

Internship dates are stored in `data/internships.json`. Deadlines change every
year, so refresh that dataset before each application season.

To unlock personalized AI coaching, create a Gemini API key in Google AI Studio
and paste it into the sidebar while the app is running. The key is used only for
that session and is not stored by Alfred Atlas. You can also set `GEMINI_API_KEY`
in your terminal before launching Streamlit.

## Project structure

```text
alfred-atlas/
|-- app.py
|-- brain/
|-- memory/
|-- profile/
|-- roadmap/
|-- ui/
|-- data/
|-- requirements.txt
`-- README.md
```

## Next upgrades

- Add an LLM-backed coach in `brain/llm_client.py`
- Store milestones and completed tasks
- Add resume parsing
- Add curated course and project recommendations
- Add role recommendations based on interests
