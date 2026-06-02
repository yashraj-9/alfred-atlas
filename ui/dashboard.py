import streamlit as st

from career.skill_analyzer import normalize_skills
from core.constants import APP_NAME, APP_TAGLINE
from core.orchestrator import CareerNavigator
from llm.gemini_client import GeminiClient
from ui.coach_page import render_coach
from ui.opportunities_page import render_recommendations
from ui.roadmap_page import render_roadmap


def run_dashboard() -> None:
    st.set_page_config(page_title=APP_NAME, page_icon="🧭", layout="wide")
    st.title(APP_NAME)
    st.caption(APP_TAGLINE)
    navigator = CareerNavigator()
    saved = navigator.memory.load_profile()
    roles = navigator.available_roles()

    with st.sidebar:
        st.header("Career profile")
        name = st.text_input("Your name", value=saved.get("name", ""))
        target = st.selectbox("Target role", roles, index=roles.index(saved["target_role"]) if saved.get("target_role") in roles else 0)
        skills = st.text_area("Current skills", value=", ".join(saved.get("skills", [])), placeholder="python, sql, excel")
        weekly_hours = st.slider("Study hours per week", 1, 20, int(saved.get("weekly_hours", 6)))
        build = st.button("Build my roadmap", type="primary", use_container_width=True)

    if build:
        profile = {
            "name": name.strip() or "Explorer",
            "target_role": target,
            "skills": normalize_skills(skills),
            "weekly_hours": weekly_hours,
        }
        st.session_state["result"] = navigator.navigate(profile)

    result = st.session_state.get("result")
    if not result:
        st.info("Complete the sidebar and click **Build my roadmap**.")
    else:
        st.subheader(f"{result['profile']['name']}'s path to {result['profile']['target_role']}")
        score, duration = st.columns(2)
        score.metric("Career readiness", f"{result['readiness']}%")
        duration.metric("Estimated roadmap", f"{result['roadmap']['estimated_weeks']} weeks")
        st.progress(result["readiness"] / 100)
        render_coach(result["readiness"], result["roadmap"]["milestones"][0]["action"])
        render_roadmap(result["roadmap"])
        render_recommendations(result["recommendations"])

    st.divider()
    st.caption(GeminiClient().status())
