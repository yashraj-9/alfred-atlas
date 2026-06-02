# Alfred Atlas

Alfred Atlas is an offline-first career navigator. It takes a target role,
compares it with a user's current skills, calculates a readiness score, and
creates a phased learning roadmap.

## Features

- Profile intake with local JSON persistence
- Built-in career library for common technology and design roles
- Skill-gap report and readiness score
- Natural-language skill recognition, including aliases such as `ml`, `js`, and `github`
- Weekly roadmap with specific outcomes, practice tasks, and portfolio evidence
- Streamlit dashboard
- Optional OpenAI-powered personalized coaching review

## Run locally

```powershell
cd alfred-atlas
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

The app runs without an API key. Profiles are saved locally in
`memory/user_profile.json`.

To unlock personalized AI coaching, paste an OpenAI API key into the sidebar
while the app is running. The key is used only for that session and is not
stored by Alfred Atlas.

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
