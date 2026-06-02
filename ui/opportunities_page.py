import streamlit as st


def render_recommendations(recommendations: dict) -> None:
    st.subheader("Recommended next steps")
    for label, items in recommendations.items():
        st.markdown(f"#### {label.title()}")
        for item in items:
            st.write(f"- **{item['title']}**: {item['description']}")
