import streamlit as st

from coach.accountability_coach import coach_summary


def render_coach(readiness: int, next_action: str) -> None:
    st.info(coach_summary(readiness, next_action))
