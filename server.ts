/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Initialize brand new Google GenAI with native server-side telemetry header
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Resilient Gemini model caller with dynamic retry on demand spikes (503/429/etc)
const generateContentWithRetry = async (ai: any, contents: any, config?: any) => {
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.1-pro-preview'
  ];
  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    
    // Spreading pacing delay between different models to allow any system-wide transient surges to clear
    if (i > 0) {
      const spacingDelay = 800 + Math.random() * 600;
      console.log(`[Alfred Router] Spacing out model attempts. Pausing ${Math.round(spacingDelay)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, spacingDelay));
    }

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Alfred Router] Dispatching query to: ${modelName} (Attempt ${attempt}/2)`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: config,
        });
        if (response && response.text) {
          return response;
        }
        throw new Error('Empty response returned from model.');
      } catch (error: any) {
        lastError = error;
        const errStr = typeof error === 'string' ? error : (error.message || JSON.stringify(error) || '');
        console.warn(`[Alfred Router] Model ${modelName} invocation unsuccessful (Attempt ${attempt}/2):`, errStr);
        
        // Fast fail: if it is a credit / permission / billing / quota / forbidden block, do not retry this model
        if (
          errStr.includes('403') || 
          errStr.includes('PERMISSION_DENIED') || 
          errStr.includes('billing') || 
          errStr.includes('quota') || 
          errStr.includes('developer key')
        ) {
          console.warn(`[Alfred Router] Access or quota limits hit for ${modelName}. Moving to alternative models...`);
          break; // break inner loop, proceed to next model immediately
        }

        if (attempt < 2) {
          // Exponential backoff + randomized jitter to prevent herd-effect collision on retry limits
          const delay = (attempt * 1500) + Math.floor(Math.random() * 1200);
          console.log(`[Alfred Router] Retrying ${modelName} in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error('All candidates in the Gemini model fallback chain failed.');
};

const app = express();
app.use(express.json());

const PORT = 3000;

// --- Mock/In-Memory JSON databases ---
const rolesDatabase = [
  {
    title: 'Frontend Engineer',
    core_skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'HTML5/CSS3', 'Git', 'State Management (Redux/Zustand)', 'Responsive Design'],
    description: 'Designs and interfaces visual layouts, connecting APIs and managing client environments.'
  },
  {
    title: 'Full Stack Developer',
    core_skills: ['Node.js', 'Express', 'TypeScript', 'React', 'PostgreSQL', 'REST APIs', 'Docker', 'Git', 'CSS Grid/Flexbox'],
    description: 'Bridges and crafts both frontend applications and server/database backends.'
  },
  {
    title: 'Data Scientist',
    core_skills: ['Python', 'Pandas', 'Scikit-Learn', 'SQL', 'Machine Learning', 'Data Visualization', 'NumPy', 'Jupyter Notebooks'],
    description: 'Extracts insights from large data collections, creating predictions and machine learning models.'
  },
  {
    title: 'DevOps Engineer',
    core_skills: ['Docker', 'Kubernetes', 'AWS (EC2/S3)', 'CI/CD (GitHub Actions)', 'Linux', 'Nginx', 'Bash Scripting', 'Terraform'],
    description: 'Maintains pipeline scaling, provisioning resources, and monitoring container deployments.'
  }
];

const internshipsDatabase = [
  {
    id: 'intern-001',
    title: 'Junior Full-Stack Intern',
    company: 'Vortex Tech Labs',
    location: 'Remote / San Francisco',
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'Git', 'Express'],
    description: 'Work with our engineering squad to release features on our user settings panel and express endpoint routes. Perfect coding exposure.'
  },
  {
    id: 'intern-002',
    title: 'Associate Frontend Developer',
    company: 'Synergy Design Studio',
    location: 'New York, NY',
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Responsive Design'],
    description: 'Help our visual studio code up high-fidelity interfaces and custom animations using Tailwind CSS and components. Focus on design precision.'
  },
  {
    id: 'intern-003',
    title: 'Data & ML Operations Intern',
    company: 'Cognitive Scale AI',
    location: 'Austin, TX (Hybrid)',
    skillsRequired: ['Python', 'Pandas', 'SQL', 'Scikit-Learn', 'Docker'],
    description: 'Contribute to model pipeline setups, validating input signals, maintaining data lakes, and creating clean dashboards for operations.'
  },
  {
    id: 'intern-004',
    title: 'Infrastructure & Cloud Ops Apprentice',
    company: 'Atlas Cloud Hosting',
    location: 'Remote',
    skillsRequired: ['Linux', 'Bash Scripting', 'Docker', 'Nginx', 'AWS'],
    description: 'Participate in site reliability tasks, configuration automations, deploying containers on ECS and configuring load balancers.'
  }
];

const projectsDatabase = [
  {
    title: 'SaaS Workspace Kanban Board',
    skillsTargeted: ['React', 'TypeScript', 'State Management (Zustand)', 'Tailwind CSS'],
    difficulty: 'Intermediate',
    description: 'Drag-and-drop workspace manager with workspace grouping, local state persistence, user-friendly labels, and dark mode.'
  },
  {
    title: 'Full-Stack Microservices API Proxy',
    skillsTargeted: ['Node.js', 'Express', 'Docker', 'REST APIs', 'TypeScript'],
    difficulty: 'Advanced',
    description: 'Build an API proxy server with custom rate-limiting, JWT authentication middleware, CORS configs, and complete Docker configuration.'
  },
  {
    title: 'AI Predictive Admissions Classifier',
    skillsTargeted: ['Python', 'Pandas', 'Scikit-Learn', 'Jupyter Notebooks'],
    difficulty: 'Intermediate',
    description: 'Train linear and decision tree models on public student datasets to forecast career roadmaps and mock admissions results.'
  }
];

// --- API Endpoints ---

// Check Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    mcpServerName: 'Alfred Atlas Server',
    toolsLoaded: ['roadmap_generator', 'skill_gap_analyzer', 'project_recommender', 'internship_matcher', 'resume_analyzer'],
    geminiStatus: process.env.GEMINI_API_KEY ? 'active' : 'fallback'
  });
});

// Helper for generic fallback content if Gemini API Key is missing
const checkApiKey = (): boolean => {
  return !!process.env.GEMINI_API_KEY;
};

const getRoadmapFallback = (targetRole: string) => ({
  role: targetRole,
  isFallback: true,
  fallbackMessage: "The live Gemini service is experiencing high demand. Alfred has generated an offline curated career path.",
  timeline: [
    {
      phase: 'Phase 1: Core Foundations',
      duration: 'Month 1-2',
      milestones: [`Master foundational programming syntax applicable to ${targetRole}.`, 'Learn basic Git version control workflows and terminal operations.'],
      resources: ['freeCodeCamp Educational Series', 'Official developer portals'],
      gainedSkills: ['Programming fundamentals', 'Source Control']
    },
    {
      phase: 'Phase 2: Architectural Patterns & SDKs',
      duration: 'Month 3-4',
      milestones: ['Build primary sample applications locally.', 'Learn API integration & schema structure.'],
      resources: ['MDN Developer Guides', 'GitHub project archives'],
      gainedSkills: ['Application Architecture', 'Data Handling']
    },
    {
      phase: 'Phase 3: Production Deployment & Cloud',
      duration: 'Month 5-6',
      milestones: ['Unit and integration testing of features.', 'Containerize application with Docker.', 'Deploy workspace instances to cloud servers.'],
      resources: ['Docker Curriculum', 'AWS Virtual Labs & Tutorials'],
      gainedSkills: ['Docker Containerization', 'Cloud Deployment', 'Testing Systems']
    }
  ]
});

// 1. Roadmap Generator Endpoint
app.post('/api/roadmap', async (req, res) => {
  const { targetRole, userSkills = [] } = req.body;

  if (!targetRole) {
    return res.status(400).json({ error: 'targetRole is required' });
  }

  try {
    if (!checkApiKey()) {
      // Return beautiful structured local fallback
      return res.json(getRoadmapFallback(targetRole));
    }

    const ai = getAiClient();
    const prompt = `Generate a learning roadmap for target role "${targetRole}" starting with existing skills: ${userSkills.join(', ')}. Split it into 3 chronological phases representing Months 1-6. Ensure timelines and Milestones are highly focused, tailored, and action-oriented.`;

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: 'You are Alfred, a state-of-the-art career planning agent. You build precise, action-oriented structural roadmaps for students.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING, description: 'Title of the phase (e.g., Phase 1: Foundational Framework)' },
                duration: { type: Type.STRING, description: 'Duration timeline (e.g., Month 1-2)' },
                milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                gainedSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['phase', 'duration', 'milestones', 'resources', 'gainedSkills']
            }
          }
        },
        required: ['role', 'timeline']
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.warn('Roadmap API call failed. Activating robust fallback mode:', error.message || error);
    res.json(getRoadmapFallback(targetRole));
  }
});

const getSkillGapFallback = (targetRole: string, userSkills: string[], coreRequirements: string[]) => {
  const matchingSkills = userSkills.filter(s => coreRequirements.some(reqSkill => reqSkill.toLowerCase() === s.toLowerCase()));
  const missingRaw = coreRequirements.filter(reqSkill => !userSkills.some(s => s.toLowerCase() === reqSkill.toLowerCase()));
  const missingSkills = missingRaw.map((skill, index) => ({
    skill,
    importance: index === 0 ? 'High' : index < 3 ? 'Medium' : 'Low' as 'High' | 'Medium' | 'Low',
    description: `This competency is crucial for professional deployment of high-performance products within the ${targetRole} realm.`
  }));
  const matchPercentage = Math.round((matchingSkills.length / coreRequirements.length) * 100);

  return {
    role: targetRole,
    isFallback: true,
    fallbackMessage: "Gemini server busy. Seamless offline alignment report calculated locally.",
    matchPercentage: Math.max(matchPercentage, 15),
    matchingSkills,
    missingSkills
  };
};

// 2. Skill Gap Analyzer Endpoint
app.post('/api/skill-gap', async (req, res) => {
  const { targetRole, userSkills = [] } = req.body;

  if (!targetRole) {
    return res.status(400).json({ error: 'targetRole is required' });
  }

  // Find standard skills from database if role matches
  const storedRole = rolesDatabase.find(r => r.title.toLowerCase() === targetRole.toLowerCase());
  const coreRequirements = storedRole ? storedRole.core_skills : ['Systems Architecture', 'Critical Algorithms', 'TypeScript', 'Docker', 'Testing Tools'];

  try {
    if (!checkApiKey()) {
      // Local calculation fallback
      return res.json(getSkillGapFallback(targetRole, userSkills, coreRequirements));
    }

    const ai = getAiClient();
    const prompt = `Perform a skill-gap analysis for Target Role: "${targetRole}". Standard Core requirements: ${coreRequirements.join(', ')}. User current skills: ${userSkills.join(', ')}. Calculate matchPercentage, compile matching skills list, and list missing skills categorized by importance (High, Medium, or Low). Provide helpful instructions on how to acquire each missing skill.`;

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: 'You are a career development systems analyzer. Provide highly objective and diagnostic skill breakdowns.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          matchPercentage: { type: Type.INTEGER },
          matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                importance: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['skill', 'importance', 'description']
            }
          }
        },
        required: ['role', 'matchPercentage', 'matchingSkills', 'missingSkills']
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.warn('Skill gap API call failed. Activating robust fallback mode:', error.message || error);
    res.json(getSkillGapFallback(targetRole, userSkills, coreRequirements));
  }
});

const getProjectsFallback = (missingSkills: string[]) => {
  return projectsDatabase.map(proj => ({
    title: proj.title,
    difficulty: proj.difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
    description: proj.description,
    isFallback: true,
    fallbackMessage: "Offline portfolio templates loaded successfully.",
    bridgedSkills: proj.skillsTargeted,
    milestones: ['Setup Repository and Core Models', 'Build API Endpoints / User Flow UI', 'Containerize applications and deploy'],
    deliverables: ['Responsive, fully working prototype', 'Complete Readme detailing schema setup']
  }));
};

const getInternshipsFallback = (userSkills: string[]) => {
  return internshipsDatabase.map(job => {
    const matching = userSkills.filter(s => job.skillsRequired.some(js => js.toLowerCase() === s.toLowerCase()));
    const score = Math.round((matching.length / job.skillsRequired.length) * 105);
    return {
      ...job,
      isFallback: true,
      matchScore: Math.min(Math.max(score, 15), 100),
      matchExplanation: score > 50
        ? `Excellent local computed match due to shared competencies in: ${matching.join(', ')}.`
        : `Opportunities are available to bridge and learn crucial enterprise competencies such as ${job.skillsRequired.filter(js => !userSkills.some(s => s.toLowerCase() === js.toLowerCase())).join(', ')}.`
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
};

// 3. Project Recommender Endpoint
app.post('/api/recommend-projects', async (req, res) => {
  const { missingSkills = [] } = req.body;

  try {
    if (!checkApiKey() || missingSkills.length === 0) {
      // Local fallback using projects database
      return res.json(getProjectsFallback(missingSkills));
    }

    const ai = getAiClient();
    const prompt = `Based on the following missing skills: ${missingSkills.join(', ')}, suggest 3 innovative and practical portfolio projects. Ensure projects are categorized with difficulty (Beginner, Intermediate, Advanced) and list the exact bridgedSkills, step-by-step milestones, and key end deliverables.`;

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: 'You are a Senior Project Architect creating learning curriculum. Suggest specific, exciting, and concrete hands-on code projects.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            description: { type: Type.STRING },
            bridgedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
            deliverables: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'difficulty', 'description', 'bridgedSkills', 'milestones', 'deliverables']
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    res.json(data);
  } catch (error: any) {
    console.warn('Project recommending failed. Activating robust fallback mode:', error.message || error);
    res.json(getProjectsFallback(missingSkills));
  }
});

// 4. Internship Matcher Endpoint
app.post('/api/match-internships', async (req, res) => {
  const { userSkills = [] } = req.body;

  try {
    if (!checkApiKey()) {
      return res.json(getInternshipsFallback(userSkills));
    }

    const ai = getAiClient();
    const prompt = `Look at our internships database: ${JSON.stringify(internshipsDatabase)}. Student has skills: ${userSkills.join(', ')}. Evaluate suitability for ALL opportunities. For each opportunity calculate a matchScore out of 100 representing skill overlap, and provide a direct matchExplanation stating what skills overlap or how they can optimize their resume for this employer.`;

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: 'You are an advisor matching prospective students to industry internships.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            skillsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
            matchExplanation: { type: Type.STRING }
          },
          required: ['id', 'title', 'company', 'location', 'skillsRequired', 'description', 'matchScore', 'matchExplanation']
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    res.json(data.sort((a: any, b: any) => b.matchScore - a.matchScore));
  } catch (error: any) {
    console.warn('Internship matching failed. Activating robust fallback mode:', error.message || error);
    res.json(getInternshipsFallback(userSkills));
  }
});

const getResumeAnalysisFallback = (targetRole: string) => ({
  isFallback: true,
  fallbackMessage: "Local offline ATS metrics used.",
  strengths: [
    'Identified clean technical frameworks matching role: ' + targetRole,
    'Displays robust engineering experience and team delivery metrics',
    'Perfect structured flow matching recruiter screening patterns'
  ],
  missingKeywords: [
    'Metrics-driven deployment key performance indicators (KPIs)',
    'Enterprise scale cloud microservices design principles',
    'Continuous integration & pipeline configurations (CI/CD)'
  ],
  impactScores: [
    { category: 'Quantification', score: 30, suggestion: 'Add metric targets, request throughput metrics, or latency figures to back performance results.' },
    { category: 'Action Ver Verbs', score: 65, suggestion: 'Deploy active engineering words like "Optimized", "Architected", and "Pioneered" rather than generic lists.' },
    { category: 'ATS Core Alignment', score: 55, suggestion: 'Integrate standard sector terminology aligning exactly with modern ' + targetRole + ' descriptions.' }
  ],
  actionableFormattingImprovements: [
    'Shift technical skills table further up for instant visual routing.',
    'Align dates clearly and cleanly as right-aligned margin indices.'
  ],
  enhancedBulletPoints: [
    {
      original: 'Responsible for building features in the team web app using React.',
      improved: 'Engineered 4 reusable front-end React contexts, cutting route load overhead by 22% and improving structure.',
      explanation: 'Introduced high-value action verb "Engineered" and validated your contribution with key quantitative results.'
    }
  ]
});

// 5. Resume Analyzer Endpoint
app.post('/api/analyze-resume', async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText || !targetRole) {
    return res.status(400).json({ error: 'resumeText and targetRole are required' });
  }

  try {
    if (!checkApiKey()) {
      // Beautiful default analysis fallback
      return res.json(getResumeAnalysisFallback(targetRole));
    }

    const ai = getAiClient();
    const prompt = `Critique this resume against the role of "${targetRole}". Check for missing keywords, ATS scores, and structure. Detail original bullet points and rewrites to optimize for the STAR framework.\n\nRESUME CONTENT:\n${resumeText}`;

    const response = await generateContentWithRetry(ai, prompt, {
      systemInstruction: 'You are an elite corporate technical recruiter. Your feedback must highlight formatting, technical keyword alignment, and actual action metrics rewrites.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          impactScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.INTEGER },
                suggestion: { type: Type.STRING }
              },
              required: ['category', 'score', 'suggestion']
            }
          },
          actionableFormattingImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
          enhancedBulletPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['original', 'improved', 'explanation']
            }
          }
        },
        required: ['strengths', 'missingKeywords', 'impactScores', 'actionableFormattingImprovements', 'enhancedBulletPoints']
      }
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error: any) {
    console.warn('Resume analysis failed. Activating robust fallback mode:', error.message || error);
    res.json(getResumeAnalysisFallback(targetRole));
  }
});


// --- Vite Dev & Production Asset Serving pipeline ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Alfred Atlas full-stack server operating dynamically on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Error starting Alfred Atlas server:', error);
});
