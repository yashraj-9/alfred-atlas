import streamlit as st


def render_roadmap(roadmap: dict) -> None:
    st.subheader("Learning roadmap")
    for milestone in roadmap["milestones"]:
        with st.expander(f"Weeks {milestone['weeks']}: {milestone['title']}", expanded=True):
            st.write(milestone["action"])
