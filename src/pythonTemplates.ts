/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { McpToolConfig, DatasetConfig } from './types';

export const pythonTemplates: McpToolConfig[] = [
  {
    name: "Alfred Atlas Main Server",
    description: "The core FastMCP execution script that boots up the JSON-RPC server and exposes all career navigator tools.",
    fileName: "app.py",
    code: `"""
Alfred Atlas MCP Server
An AI-powered career navigator server built using modern FastMCP.
Exposes tools for roadmapping, resume analysis, skill-gap analysis, and matches.
"""
import os
import json
from mcp.server.fastmcp import FastMCP
from google import genai
from google.genai import types

# Initialize FastMCP Server
mcp = FastMCP("Alfred Atlas")

# Helper to get the GenAI client
def get_ai_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is missing!")
    return genai.Client(api_key=api_key)

# Helper to load dataset
def load_dataset(file_name: str):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "datasets", file_name)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# --- Tool 1: Roadmap Generator ---
@mcp.tool()
def generate_roadmap(target_role: str, user_skills: list[str]) -> str:
    """
    Generates a personalized learning roadmap with phases, milestones, and resources 
    to help a student achieve a target role starting from their current skills.
    """
    client = get_ai_client()
    skills_str = ", ".join(user_skills) if user_skills else "None listed"
    
    prompt = f\"\"\"
    Target Role: {target_role}
    Current Skills: {skills_str}
    
    Generate a highly strategic, structured learning roadmap split into 3 logical phases.
    For each phase specify:
    1. Phase Duration (e.g. Month 1-2)
    2. Phase Title
    3. Specific Milestones
    4. Free/Accessible Learning Resources
    5. Specific Skills gained in this phase
    
    Structure the response clearly using markdown.
    \"\"\"
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are Alfred, a precise educational advisor helping students learn exactly what is necessary."
        )
    )
    return response.text

# --- Tool 2: Skill Gap Analyzer ---
@mcp.tool()
def analyze_skill_gap(target_role: str, user_skills: list[str]) -> str:
    """
    Performs a skill-gap analysis against target role requirements.
    Lists matching skills and details missing high, medium, and low importance skills.
    """
    client = get_ai_client()
    roles_data = load_dataset("roles.json")
    
    # Try to find standard requirements
    role_reqs = "No standard requirements found in dataset."
    for r in roles_data:
        if r["title"].lower() == target_role.lower():
            role_reqs = json.dumps(r["core_skills"])
            break
            
    skills_str = ", ".join(user_skills)
    prompt = f\"\"\"
    Target Role: {target_role}
    Role Database Requirements: {role_reqs}
    User's Current Skills: {skills_str}
    
    1. Calculate a match percentage from 0 to 100%.
    2. Highlight exact matching skills.
    3. List missing skills categorized by Importance (High / Medium / Low), with brief instructions on why each is needed.
    
    Provide an analytical markdown report.
    \"\"\"
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction="You are an industry skills recruitment analyst."
        )
    )
    return response.text

# --- Tool 3: Project Recommender ---
@mcp.tool()
def recommend_projects(missing_skills: list[str]) -> str:
    """
    Recommends custom portfolio projects focused heavily on bridging specific missing skills.
    """
    client = get_ai_client()
    skills_str = ", ".join(missing_skills)
    
    prompt = f\"\"\"
    Skills to Bridge: {skills_str}
    
    Recommend 2 highly practical, comprehensive coding projects (one Intermediate, one Advanced) 
    that directly force the builder to learn and use these skills.
    For each project provide:
    1. Project Title
    2. Visual Deliverables & Output description
    3. Milestones to complete
    4. Exact tech stack suggestions
    \"\"\"
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

# --- Tool 4: Internship Matcher ---
@mcp.tool()
def match_internships(user_skills: list[str]) -> str:
    """
    Matches user's skills against open roles in our internships datastore, returning aligned offers.
    """
    internships = load_dataset("internships.json")
    if not internships:
        return "No internship positions currently cataloged."
        
    client = get_ai_client()
    skills_str = ", ".join(user_skills)
    
    prompt = f\"\"\"
    Student's Skills: {skills_str}
    Internships Database: {json.dumps(internships, indent=2)}
    
    Examine the internships listed in the dataset. Aligned with the student's skills, find the top 2 matches.
    For each match explain:
    1. Percentage Match Compatibility
    2. Why they qualify / Where they are missing any nice-to-have parameters
    3. Action items to submit a stronger application
    \"\"\"
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

# --- Tool 5: Resume Analyzer ---
@mcp.tool()
def analyze_resume(resume_text: str, target_role: str) -> str:
    """
    Critiques a student's resume text against a target role.
    Extracts strengths, matches missing keywords, scores impact, and improves bullet points.
    """
    client = get_ai_client()
    
    prompt = f\"\"\"
    Target Position: {target_role}
    Resume Plaintext:
    {resume_text}
    
    Deliver a comprehensive resume report:
    1. Key Strengths detected.
    2. Missing keywords or industry jargon relative to {target_role}.
    3. Impact metrics score (0-100) assessing if their bullet points quantify achievements, with custom critiques.
    4. Interactive suggestions (Original vs Improved rewrite) of up to 2 accomplishments using the STAR framework.
    \"\"\"
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text

if __name__ == "__main__":
    mcp.run()
`
  },
  {
    name: "Gemini Integration Client",
    description: "Configures client settings, handles API rate-limits, and structures model calls neatly for standard python operations.",
    fileName: "llm/gemini_client.py",
    code: `"""
Alfred Atlas - Gemini Client Wrapper
Uses the modern Google GenAI SDK for server queries.
"""
import os
from google import genai
from google.genai import types

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not defined.")
        self.client = genai.Client(api_key=api_key)
        
    def generate(self, prompt: str, system_instruction: str = None) -> str:
        config = types.GenerateContentConfig()
        if system_instruction:
            config.system_instruction = system_instruction
            
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            return f"Error contacting Gemini API: {str(e)}"
`
  }
];

export const datasetTemplates: DatasetConfig[] = [
  {
    name: "Roles Database",
    fileName: "datasets/roles.json",
    content: JSON.stringify([
      {
        "title": "Frontend Engineer",
        "core_skills": ["React", "TypeScript", "Tailwind CSS", "Vite", "HTML5/CSS3", "Git", "State Management (Redux/Zustand)", "Responsive Design"],
        "description": "Designs and interfaces visual layouts, connecting APIs and managing client environments."
      },
      {
        "title": "Full Stack Developer",
        "core_skills": ["Node.js", "Express", "TypeScript", "React", "PostgreSQL", "REST APIs", "Docker", "Git", "CSS Grid/Flexbox"],
        "description": "Bridges and crafts both frontend applications and server/database backends."
      },
      {
        "title": "Data Scientist",
        "core_skills": ["Python", "Pandas", "Scikit-Learn", "SQL", "Machine Learning", "Data Visualization", "NumPy", "Jupyter Notebooks"],
        "description": "Extracts insights from large data collections, creating predictions and machine learning models."
      },
      {
        "title": "DevOps Engineer",
        "core_skills": ["Docker", "Kubernetes", "AWS (EC2/S3)", "CI/CD (GitHub Actions)", "Linux", "Nginx", "Bash Scripting", "Terraform"],
        "description": "Maintains pipeline scaling, provisioning resources, and monitoring container deployments."
      }
    ], null, 2)
  },
  {
    name: "Internships Database",
    fileName: "datasets/internships.json",
    content: JSON.stringify([
      {
        "id": "intern-001",
        "title": "Junior Full-Stack Intern",
        "company": "Vortex Tech Labs",
        "location": "Remote / San Francisco",
        "skillsRequired": ["React", "Node.js", "TypeScript", "Git", "Express"],
        "description": "Work with our engineering squad to release features on our user settings panel and express endpoint routes. Perfect coding exposure."
      },
      {
        "id": "intern-002",
        "title": "Associate Frontend Developer",
        "company": "Synergy Design Studio",
        "location": "New York, NY",
        "skillsRequired": ["React", "TypeScript", "Tailwind CSS", "Figma", "Responsive Design"],
        "description": "Help our visual studio code up high-fidelity interfaces and custom animations using Tailwind CSS and components. Focus on design precision."
      },
      {
        "id": "intern-003",
        "title": "Data & ML Operations Intern",
        "company": "Cognitive Scale AI",
        "location": "Austin, TX (Hybrid)",
        "skillsRequired": ["Python", "Pandas", "SQL", "Scikit-Learn", "Docker"],
        "description": "Contribute to model pipeline setups, validating input signals, maintaining data lakes, and creating clean dashboards for operations."
      },
      {
        "id": "intern-004",
        "title": "Infrastructure & Cloud Ops Apprentice",
        "company": "Atlas Cloud Hosting",
        "location": "Remote",
        "skillsRequired": ["Linux", "Bash Scripting", "Docker", "Nginx", "AWS"],
        "description": "Participate in site reliability tasks, configuration automations, deploying containers on ECS and configuring load balancers."
      }
    ], null, 2)
  },
  {
    name: "Sample Portfolio Projects Finder",
    fileName: "datasets/projects.json",
    content: JSON.stringify([
      {
        "title": "SaaS Workspace Kanban Board",
        "skillsTargeted": ["React", "TypeScript", "State Management (Zustand)", "Tailwind CSS"],
        "difficulty": "Intermediate",
        "description": "Drag-and-drop workspace manager with workspace grouping, local state persistence, user-friendly labels, and dark mode."
      },
      {
        "title": "Full-Stack Microservices API Proxy",
        "skillsTargeted": ["Node.js", "Express", "Docker", "REST APIs", "TypeScript"],
        "difficulty": "Advanced",
        "description": "Build an API proxy server with custom rate-limiting, JWT authentication middleware, CORS configs, and complete Docker configuration."
      },
      {
        "title": "AI Predictive Admissions Classifier",
        "skillsTargeted": ["Python", "Pandas", "Scikit-Learn", "Jupyter Notebooks"],
        "difficulty": "Intermediate",
        "description": "Train linear and decision tree models on public student datasets to forecast career roadmaps and mock admissions results."
      }
    ], null, 2)
  }
];
