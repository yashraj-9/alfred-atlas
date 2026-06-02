from __future__ import annotations

import streamlit as st

from brain.orchestrator import CareerNavigator
from llm.gemini_client import GeminiClient


def _render_results(result: dict) -> None:
    profile = result["profile"]
    gap = result["gap"]
    focus_areas = result["focus_areas"]
    roadmap = result["roadmap"]
    recommendations = result["recommendations"]
    datasets = result["datasets"]
    model_insights = result["model_insights"]

    st.subheader(f"{profile['name']}'s path to {profile['target_role']}")
    score, duration, time = st.columns(3)
    score.metric("Career readiness", f"{gap['readiness_score']}%")
    duration.metric("Estimated roadmap", f"{roadmap['estimated_weeks']} weeks")
    time.metric("Weekly commitment", f"{roadmap['weekly_hours']} hours")
    st.progress(gap["readiness_score"] / 100)
    st.info(
        f"Recommended focus: **{model_insights['recommended_focus']}** "
        f"({model_insights['confidence']}% confidence). "
        f"Next capability: **{model_insights['next_capability'].title()}**. "
        f"Start with: **{model_insights['dataset_start']}**."
    )

    left, right = st.columns(2)
    with left:
        st.markdown("#### Skills Alfred recognized")
        st.write(", ".join(skill.title() for skill in gap["matched_skills"]) or "No matching core skills recognized yet.")
        if gap["developing_skills"]:
            st.caption("Needs strengthening: " + ", ".join(skill.title() for skill in gap["developing_skills"]))
    with right:
        st.markdown("#### Skills to build next")
        st.write(", ".join(skill.title() for skill in gap["missing_skills"]) or "You have the core skills. Focus on portfolio depth.")

    if focus_areas:
        st.markdown("#### Suggested specialization tracks")
        for area in focus_areas:
            st.write(f"**{area['name']}**: {area['why']}")
            if area["missing_prerequisites"]:
                st.caption("Prerequisites to strengthen: " + ", ".join(skill.title() for skill in area["missing_prerequisites"]))

    st.markdown("#### Your learning roadmap")
    for phase in roadmap["phases"]:
        with st.expander(f"Weeks {phase['weeks']}: {phase['skill']}", expanded=True):
            st.caption(phase["status"])
            st.write(f"**Outcome:** {phase['outcome']}")
            st.write("**Weekly tasks:**")
            for task in phase["tasks"]:
                st.write(f"- {task}")
            st.write(f"**Evidence to publish:** {phase['proof']}")

    if gap["bonus_skills"]:
        st.info("Optional skills for later: " + ", ".join(skill.title() for skill in gap["bonus_skills"]))

    st.markdown("#### Dataset recommendations")
    for dataset in datasets:
        st.write(
            f"**{dataset['title']}** ({dataset['domain']}, {dataset['difficulty']}): "
            f"{dataset['description']}"
        )

    st.markdown("#### Project directions")
    for item in recommendations["specialization_projects"]:
        st.write(f"**{item['title']}**: {item['description']}")

    if recommendations["projects"]:
        st.markdown("#### Recommended portfolio projects")
        for item in recommendations["projects"]:
            st.write(f"**{item['title']}**: {item['description']}")

    if recommendations["courses"]:
        st.markdown("#### Recommended learning paths")
        for item in recommendations["courses"]:
            st.write(f"**{item['title']}**: {item['description']}")

    if recommendations["internships"]:
        st.markdown("#### Internship targets")
        for item in recommendations["internships"]:
            fit = item.get("fit", "Match")
            st.write(f"**{item['title']}** ({fit}): {item['description']}")
            if item.get("missing_required"):
                st.caption("Before applying, strengthen: " + ", ".join(skill.title() for skill in item["missing_required"]))

    if recommendations["bonus_skills"]:
        st.caption("Later-stage bonus skills: " + ", ".join(skill.title() for skill in recommendations["bonus_skills"]))


def run_dashboard() -> None:
    st.set_page_config(page_title="Alfred Atlas", page_icon="AA", layout="wide")
    st.title("Alfred Atlas")
    st.caption("Your practical career navigator: assess your skills, find the gaps, and build a roadmap.")

    navigator = CareerNavigator()
    saved = navigator.load_profile()

    with st.sidebar:
        st.header("Career profile")
        name = st.text_input("Your name", value=saved.get("name", ""))
        current_status = st.text_input(
            "Current status",
            value=saved.get("current_status", ""),
            placeholder="Example: 2nd-year engineering student",
        )
        target_role = st.selectbox(
            "Target career",
            navigator.roles(),
            index=navigator.roles().index(saved["target_role"]) if saved.get("target_role") in navigator.roles() else 0,
        )
        skills = st.text_area(
            "Current skills",
            value=saved.get("raw_skills", ", ".join(saved.get("skills", []))),
            placeholder="Example: Python and basic ML, SQL, Excel",
            help="Write naturally. Alfred recognizes common aliases such as ML, JS, and GitHub.",
        )
        interests = st.text_input(
            "Interests",
            value=", ".join(saved.get("interests", [])),
            placeholder="Example: analytics, design, automation",
        )
        weekly_hours = st.slider("Hours available per week", 1, 20, int(saved.get("weekly_hours", 6)))
        build = st.button("Build my roadmap", type="primary", use_container_width=True)
        st.divider()
        st.markdown("#### Optional Gemini coach")
        gemini_key = st.text_input(
            "Gemini API key",
            type="password",
            help="Used only for this running session. It is not written to disk.",
        )
        model = st.text_input("Gemini model", value="gemini-2.5-flash")

    st.markdown("### Turn a career goal into a weekly plan")
    st.write(
        "Fill in your profile in the sidebar. Alfred Atlas recognizes your existing "
        "skills, identifies the highest-impact gaps, and turns them into evidence you can publish."
    )

    if build:
        st.session_state["result"] = navigator.navigate(
            {
                "name": name,
                "current_status": current_status,
                "target_role": target_role,
                "skills": skills,
                "interests": interests,
                "weekly_hours": weekly_hours,
            }
        )
        st.session_state.pop("coach_review", None)

    if "result" in st.session_state:
        result = st.session_state["result"]
        _render_results(result)
        st.markdown("### Ask the Gemini coach")
        coach = GeminiClient(api_key=gemini_key, model=model)
        st.caption(coach.status())
        question = st.text_input(
            "What do you want the coach to focus on?",
            placeholder="Example: I only have one month. What should I prioritize?",
        )
        if st.button("Generate personalized coaching"):
            if not coach.configured:
                st.warning("Add your Gemini API key in the sidebar first.")
            else:
                with st.spinner("Thinking through your plan..."):
                    try:
                        st.session_state["coach_review"] = coach.coaching_review(result, question)
                    except RuntimeError as exc:
                        st.error(str(exc))
        if "coach_review" in st.session_state:
            st.markdown(st.session_state["coach_review"])
    else:
        st.info("Start by completing the sidebar, then click **Build my roadmap**.")

    st.divider()
    st.caption("Offline analysis works without an API key. Gemini coaching is optional.")
