import streamlit as st

from resume.ats_checker import ats_check
from resume.resume_analyzer import analyze_resume
from resume.resume_parser import parse_resume_text


def render_resume_page() -> None:
    text = st.text_area("Paste resume text for a quick check")
    if st.button("Check resume"):
        for tip in analyze_resume(parse_resume_text(text)) + ats_check(text):
            st.write(f"- {tip}")
