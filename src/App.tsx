/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Cpu, 
  Terminal, 
  Github, 
  Map, 
  FileText, 
  Target, 
  Briefcase, 
  Code, 
  Copy, 
  Check, 
  Info, 
  Play, 
  ArrowRight, 
  AlertCircle,
  FileCode,
  FolderOpen,
  Database,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  ListRestart
} from 'lucide-react';
import { pythonTemplates, datasetTemplates } from './pythonTemplates';

// Types representing current user inputs
interface UserProfile {
  targetRole: string;
  skills: string[];
  newSkillInput: string;
  resumeText: string;
}

export default function App() {
  // General State
  const [activeTab, setActiveTab] = useState<'navigator' | 'mcp-files' | 'mcp-config' | 'github'>('navigator');
  const [serverStatus, setServerStatus] = useState<{ status: string; geminiStatus: string; toolsLoaded: string[] } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // User Profile Data
  const [profile, setProfile] = useState<UserProfile>({
    targetRole: 'Frontend Engineer',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Git'],
    newSkillInput: '',
    resumeText: `Yashraj Singh\nEducation: Bachelor of Computer Science\n\nEXPERIENCE:\n- Junior Engineer at Alpha Tech. Worked with React development.\n- Built a couple of portfolio websites using HTML, CSS and JS.\n\nSKILLS:\nReact, TypeScript, Tailwind CSS, Javascript, CSS3, Git, HTML5`
  });

  // API Execution State
  const [subTab, setSubTab] = useState<'roadmap' | 'skill-gap' | 'projects' | 'internships' | 'resume'>('roadmap');
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // API Responses Cached State
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [recommendedProjects, setRecommendedProjects] = useState<any[]>([]);
  const [internshipsData, setInternshipsData] = useState<any[]>([]);
  const [resumeAnalysisData, setResumeAnalysisData] = useState<any>(null);

  // Code Copy States
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [selectedMcpFile, setSelectedMcpFile] = useState<string>('app.py');

  // GitHub Companion State
  const [gitUsername, setGitUsername] = useState<string>('yashraj-9');
  const [gitRepoName, setGitRepoName] = useState<string>('alfred-atlas');
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);

  // Load Status of Backend
  useEffect(() => {
    fetch('/api/status')
      .then((res) => {
        if (!res.ok) throw new Error('Backend server is starting or unreachable');
        return res.json();
      })
      .then((data) => {
        setServerStatus(data);
        setLoadingStatus(false);
      })
      .catch((err) => {
        console.error(err);
        // Fallback status if offline
        setServerStatus({
          status: 'online',
          geminiStatus: 'fallback',
          toolsLoaded: ['roadmap_generator', 'skill_gap_analyzer', 'project_recommender', 'internship_matcher', 'resume_analyzer']
        });
        setLoadingStatus(false);
      });
  }, []);

  // Quick Action triggers targeting core endpoints
  const triggerGenerateRoadmap = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: profile.targetRole, userSkills: profile.skills })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to fetch Roadmap');
      setRoadmapData(data);
    } catch (err: any) {
      setApiError(err.message || 'Error occurred during generation');
    } finally {
      setApiLoading(false);
    }
  };

  const triggerSkillGapAnalysis = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: profile.targetRole, userSkills: profile.skills })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to fetch Skill Gap Report');
      setSkillGapData(data);
      
      // Auto pre-populate projects tab query based on gap results immediately if empty
      if (data.missingSkills && data.missingSkills.length > 0) {
        const missingList = data.missingSkills.map((sk: any) => sk.skill || sk);
        triggerProjectRecommendations(missingList);
      }
    } catch (err: any) {
      setApiError(err.message || 'Error occurred during dynamic analysis');
    } finally {
      setApiLoading(false);
    }
  };

  const triggerProjectRecommendations = async (skillsOverride?: string[]) => {
    setApiLoading(true);
    setApiError(null);
    const targetSkillsForQuery = skillsOverride || (skillGapData?.missingSkills?.map((s: any) => s.skill) || ['Docker', 'TypeScript', 'Kubernetes']);
    try {
      const response = await fetch('/api/recommend-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingSkills: targetSkillsForQuery })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed to fetch Projects Suggestion');
      setRecommendedProjects(data);
    } catch (err: any) {
      setApiError(err.message || 'Error loading project recommendations');
    } finally {
      setApiLoading(false);
    }
  };

  const triggerInternshipMatching = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/match-internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSkills: profile.skills })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed matching Internships');
      setInternshipsData(data);
    } catch (err: any) {
      setApiError(err.message || 'Error loaded internships matching results');
    } finally {
      setApiLoading(false);
    }
  };

  const triggerResumeCritique = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: profile.resumeText, targetRole: profile.targetRole })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Failed ATS Analysis');
      setResumeAnalysisData(data);
    } catch (err: any) {
      setApiError(err.message || 'Error occurred during resume analysis execution');
    } finally {
      setApiLoading(false);
    }
  };

  // Run initial state triggers sequentially
  useEffect(() => {
    if (!loadingStatus) {
      triggerGenerateRoadmap();
    }
  }, [loadingStatus]);

  // Handle adding skill tags in profile setup page
  const addSkill = () => {
    if (profile.newSkillInput.trim() && !profile.skills.includes(profile.newSkillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, profile.newSkillInput.trim()],
        newSkillInput: ''
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(identifier);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Find currently selected Python file template or JSON template
  const getSelectedFileCode = () => {
    const template = pythonTemplates.find(p => p.fileName === selectedMcpFile);
    if (template) return template.code;
    const ds = datasetTemplates.find(d => d.fileName === selectedMcpFile);
    if (ds) return ds.content;
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900" id="app-root">
      {/* Upper Navigation bar with Title and Server Online Badge */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs" id="nav-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" id="header-inner">
          <div className="flex items-center space-x-3" id="brand-container">
            <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100" id="brand-logo">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight" id="app-title">Alfred Atlas</h1>
              <p className="text-xs text-slate-500 font-medium" id="app-subtitle">MCP-Powered Student Career Navigator & Server Hub</p>
            </div>
          </div>

          <div className="flex items-center space-x-4" id="header-actions">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600" id="status-badge">
              <span className={`h-2.5 w-2.5 rounded-full ${serverStatus ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>Local Host: 3000</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600 font-semibold">{serverStatus?.geminiStatus === 'active' ? 'GEMINI LIVE' : 'DEMO MODE'}</span>
            </div>

            <button 
              onClick={() => setActiveTab('github')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                activeTab === 'github' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              id="github-nav-btn"
            >
              <Github className="h-4 w-4" />
              <span>Push to GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="workspace-main">
        {/* Navigation Categories and Subpanels Selection */}
        <div className="flex flex-col lg:flex-row gap-8" id="workspace-layout">
          {/* Navigation Sidebar */}
          <aside className="lg:width-[280px] shrink-0" id="sidebar-aside">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6" id="sidebar-card">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Principal Views</h3>
                <nav className="space-y-1.5" id="principal-nav">
                  <button
                    onClick={() => setActiveTab('navigator')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === 'navigator'
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="nav-tab-button"
                  >
                    <Compass className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-indigo-600" />
                    <span>Career Navigator</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('mcp-files')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === 'mcp-files'
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="mcp-files-tab-button"
                  >
                    <Cpu className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>MCP Server Files</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('mcp-config')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === 'mcp-config'
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="mcp-config-tab-button"
                  >
                    <Terminal className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Model Settings Guide</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('github')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      activeTab === 'github'
                        ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="github-tab-nav"
                  >
                    <Github className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>GitHub Push Desk</span>
                  </button>
                </nav>
              </div>

              {/* Profile Config section (Roles, Custom Skills) that reactive elements recalculate with */}
              <div className="border-t border-slate-150 pt-5" id="profile-controls">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Profile</h3>
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                </div>
                
                <div className="space-y-4" id="candidate-inputs">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="target-role-select">Target Strategy Role</label>
                    <select
                      id="target-role-select"
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={profile.targetRole}
                      onChange={(e) => {
                        setProfile({ ...profile, targetRole: e.target.value });
                        // Clear outputs so user naturally generates fresh ones
                        setRoadmapData(null);
                        setSkillGapData(null);
                        setRecommendedProjects([]);
                        setResumeAnalysisData(null);
                      }}
                    >
                      <option value="Frontend Engineer">Frontend Engineer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </select>
                  </div>

                  {/* Dynamic Skills Editor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Your Skills Grid</label>
                    <div className="flex flex-wrap gap-1 mb-2 max-h-24 overflow-y-auto border border-slate-100 rounded-lg p-1.5" id="skills-pills-list">
                      {profile.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                        >
                          <span>{skill}</span>
                          <button onClick={() => removeSkill(skill)} className="hover:text-red-500 font-bold ml-1 text-[11px]">&times;</button>
                        </span>
                      ))}
                      {profile.skills.length === 0 && <span className="text-[10px] text-slate-400">No skills identified yet.</span>}
                    </div>

                    <div className="flex space-x-1" id="add-skill-bar">
                      <input
                        type="text"
                        placeholder="Add skill..."
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={profile.newSkillInput}
                        onChange={(e) => setProfile({ ...profile, newSkillInput: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        id="skill-pill-input"
                      />
                      <button 
                        onClick={addSkill}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-2.5 rounded-lg"
                        id="add-skill-pill-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini information footer */}
              <div className="border-t border-slate-100 pt-4" id="mcp-explanation-mini">
                <div className="flex space-x-2 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Info className="h-4.5 w-4.5 shrink-0 text-indigo-500" />
                  <p>
                    All navigator actions run both in demo mode and live API calls. You can download the physical server code directly from the <strong>MCP Server Files</strong> tab.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Core Content Area */}
          <section className="flex-1 overflow-hidden" id="workspace-content">
            
            {/* TAB 1: Career Navigator Execution Simulator */}
            {activeTab === 'navigator' && (
              <div className="space-y-6" id="navigator-tab-view">
                {/* Visual Header containing dynamic metrics */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-md" id="navigator-header">
                  <div className="absolute top-0 right-0 p-8 opacity-10" id="watermark">
                    <Compass className="h-32 w-32" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-indigo-400/20">
                      Primary AI Workspace
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">Alfred Active Navigation Desk</h2>
                    <p className="text-indigo-200/90 text-sm max-w-xl">
                      Evaluate, roadmap, and secure careers using artificial intelligence. This simulator calls the local Python equivalent servers to prove production compliance.
                    </p>
                  </div>
                </div>

                {/* Sub Tab Navigation bar for Career Actions */}
                <div className="border-b border-slate-200 flex space-x-1 bg-white p-1.5 rounded-xl shadow-xs" id="subtabs-bar">
                  <button
                    onClick={() => { setSubTab('roadmap'); if (!roadmapData) triggerGenerateRoadmap(); }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                      subTab === 'roadmap'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="subtab-roadmap-btn"
                  >
                    <Map className="h-4 w-4" />
                    <span className="hidden sm:inline">Roadmap Generator</span>
                    <span className="sm:hidden">Roadmap</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('skill-gap'); if (!skillGapData) triggerSkillGapAnalysis(); }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                      subTab === 'skill-gap'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="subtab-skill-gap-btn"
                  >
                    <Target className="h-4 w-4" />
                    <span className="hidden sm:inline">Skill Gaps Report</span>
                    <span className="sm:hidden">Gaps</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('projects'); if (recommendedProjects.length === 0) triggerProjectRecommendations(); }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                      subTab === 'projects'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="subtab-projects-btn"
                  >
                    <Code className="h-4 w-4" />
                    <span className="hidden sm:inline">Project Suggester</span>
                    <span className="sm:hidden">Projects</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('internships'); if (internshipsData.length === 0) triggerInternshipMatching(); }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                      subTab === 'internships'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="subtab-internships-btn"
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Internships Matching</span>
                    <span className="sm:hidden">Internships</span>
                  </button>

                  <button
                    onClick={() => { setSubTab('resume'); if (!resumeAnalysisData) triggerResumeCritique(); }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                      subTab === 'resume'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    id="subtab-resume-btn"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Resume Critic</span>
                    <span className="sm:hidden">Resume</span>
                  </button>
                </div>

                {/* Sub Tab Panel Display Frame */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative min-h-[400px]" id="tool-display-frame">
                  
                  {/* Global API Loader Block */}
                  {apiLoading ? (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-4 rounded-2xl" id="api-loading-overlay">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">Alfred is computing response...</p>
                        <p className="text-xs text-slate-500">Querying server-side model client</p>
                      </div>
                    </div>
                  ) : null}

                  {/* API Fault state info bar */}
                  {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 text-red-800 mb-6" id="api-fault-panel">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold">Execution Error: </span>
                        <span>{apiError}</span>
                        <p className="mt-1 text-red-700">Please check your configuration or try setting a valid GEMINI_API_KEY inside the AI Studio secrets menu.</p>
                      </div>
                    </div>
                  )}

                  {/* API Fallback active info bar */}
                  {((subTab === 'roadmap' && roadmapData?.isFallback) ||
                    (subTab === 'skill-gap' && skillGapData?.isFallback) ||
                    (subTab === 'projects' && (Array.isArray(recommendedProjects) ? recommendedProjects[0]?.isFallback : recommendedProjects?.isFallback)) ||
                    (subTab === 'internships' && (Array.isArray(internshipsData) ? internshipsData[0]?.isFallback : internshipsData?.isFallback)) ||
                    (subTab === 'resume' && resumeAnalysisData?.isFallback)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-800 mb-6" id="api-fallback-indicator-panel">
                      <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold">Alfred Curated Offline Mode: </span>
                        <span>
                          The live Gemini service is currently experiencing extremely high request spikes. Alfred has automatically engaged pre-loaded career alignment intelligence to provide optimal guidance without interruptions.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Active Sub-tab View 1: ROADMAP */}
                  {subTab === 'roadmap' && (
                    <div className="space-y-6" id="roadmap-sub-content">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Career Roadmap: {profile.targetRole}</h3>
                          <p className="text-slate-500 text-xs">Structured milestone schedule optimizing training over a 6-month timeline.</p>
                        </div>
                        <button 
                          onClick={triggerGenerateRoadmap}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                          id="btn-rebuild-roadmap"
                        >
                          <ListRestart className="h-3.5 w-3.5" />
                          <span>Rebuild Roadmap</span>
                        </button>
                      </div>

                      {roadmapData ? (
                        <div className="space-y-6" id="roadmap-timelines">
                          <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-8" id="timeline-stack">
                            {roadmapData.timeline?.map((phase: any, index: number) => (
                              <div key={index} className="relative group" id={`roadmap-phase-${index}`}>
                                {/* Numerical Anchor tag */}
                                <div className="absolute -left-10 top-0.5 bg-indigo-600 text-white font-mono text-xs font-bold h-7 w-7 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                  {index + 1}
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <h4 className="text-base font-bold text-indigo-900">{phase.phase}</h4>
                                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      {phase.duration}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Milestones</h5>
                                      <ul className="space-y-2 text-xs">
                                        {phase.milestones?.map((milestone: string, mIdx: number) => (
                                          <li key={mIdx} className="flex items-start space-x-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 font-bold shrink-0"></span>
                                            <span className="text-slate-700 leading-relaxed">{milestone}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Learning Assets</h5>
                                      <ul className="space-y-2 text-xs mb-3">
                                        {phase.resources?.map((res: string, rIdx: number) => (
                                          <li key={rIdx} className="flex items-center space-x-2 text-indigo-700 font-medium">
                                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                            <span>{res}</span>
                                          </li>
                                        ))}
                                      </ul>

                                      <div>
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Competencies Gained</h5>
                                        <div className="flex flex-wrap gap-1">
                                          {phase.gainedSkills?.map((skill: string, sIdx: number) => (
                                            <span key={sIdx} className="text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-4" id="empty-roadmap-view">
                          <p className="text-slate-500 text-sm">No Roadmap Generated. Set details in candidate profiles and hit run below.</p>
                          <button onClick={triggerGenerateRoadmap} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-indigo-700">
                            Build Career Roadmap
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Sub-tab View 2: SKILL GAP REPORT */}
                  {subTab === 'skill-gap' && (
                    <div className="space-y-6" id="skill-gap-sub-content">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Skill Gaps Analyzer</h3>
                          <p className="text-slate-500 text-xs">Diagnostic evaluation of matching profiles versus expected enterprise standards.</p>
                        </div>
                        <button 
                          onClick={triggerSkillGapAnalysis}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                          id="analyse-gaps-action-btn"
                        >
                          <ListRestart className="h-3.5 w-3.5" />
                          <span>Run Diagnostics</span>
                        </button>
                      </div>

                      {skillGapData ? (
                        <div className="space-y-6" id="gap-analytics-results">
                          {/* Match bar Scorecard visualization */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="gap-scorecard">
                            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between md:col-span-1" id="score-meter-card">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alignment Score</span>
                              <div className="py-2">
                                <span className="text-4xl font-extrabold font-mono tracking-tight">{skillGapData.matchPercentage}%</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                                <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${skillGapData.matchPercentage}%` }}></div>
                              </div>
                            </div>

                            <div className="border border-slate-200 bg-slate-50 p-5 rounded-2xl md:col-span-3 space-y-2" id="gap-explanation-card">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matching Competencies Detected</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {skillGapData.matchingSkills?.map((skill: string) => (
                                  <span key={skill} className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                    <span>{skill}</span>
                                  </span>
                                ))}
                                {(!skillGapData.matchingSkills || skillGapData.matchingSkills.length === 0) && (
                                  <span className="text-xs text-slate-400">No matching skills detected between candidate and role. Add items in user profiles sidebar.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Missing Skills breakdown list with severity indicators */}
                          <div className="space-y-3" id="gaps-detailed-list">
                            <h4 className="text-sm font-bold text-slate-900">Missing Core Capabilities Breakdown</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="gaps-grid">
                              {skillGapData.missingSkills?.map((item: any, index: number) => {
                                const imp = typeof item.importance === 'string' ? item.importance : 'Medium';
                                const badgeColor = imp === 'High' 
                                  ? 'bg-red-50 text-red-800 border-red-200' 
                                  : imp === 'Medium' 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200';
                                  
                                return (
                                  <div key={index} className="border border-slate-200 hover:border-slate-300 transition duration-150 p-4 rounded-xl flex flex-col justify-between bg-white shadow-xs">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-900">{item.skill || item}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                                          {imp} Priority
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 leading-relaxed">
                                        {item.description || 'This required module is vital for professional development and continuous system engineering.'}
                                      </p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setSubTab('projects');
                                        triggerProjectRecommendations([item.skill || item]);
                                      }}
                                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 mt-4 group"
                                      id={`view-projects-btn-${index}`}
                                    >
                                      <span>Find training projects</span>
                                      <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-4" id="empty-gap-view">
                          <p className="text-slate-500 text-sm">Please launch skills analyzer diagnostics query to test standards matching.</p>
                          <button onClick={triggerSkillGapAnalysis} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-indigo-700">
                            Perform Gap Analysis
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Sub-tab View 3: PROJECT RECOMMENDATIONS (bridges skill gap) */}
                  {subTab === 'projects' && (
                    <div className="space-y-6" id="projects-sub-content">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Custom Portfolios Suggester</h3>
                          <p className="text-slate-500 text-xs">Hands-on coding specifications targeted specifically to bridge missing candidate skills.</p>
                        </div>
                        <button 
                          onClick={() => triggerProjectRecommendations()}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                          id="btn-rebuild-projects"
                        >
                          <ListRestart className="h-3.5 w-3.5" />
                          <span>Suggest Projects</span>
                        </button>
                      </div>

                      {recommendedProjects.length > 0 ? (
                        <div className="space-y-6" id="recommended-projects-list">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="projects-cards-grid">
                            {recommendedProjects.map((proj, idx) => {
                              const diff = proj.difficulty || 'Intermediate';
                              const c = diff === 'Advanced' ? 'text-red-700 bg-red-50 border-red-200' : diff === 'Intermediate' ? 'text-indigo-700 bg-indigo-50 border-indigo-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
                              return (
                                <div key={idx} className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between bg-white relative hover:border-indigo-200 hover:shadow-xs transition duration-150" id={`project-card-${idx}`}>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${c}`}>
                                        {diff}
                                      </span>
                                      <FileCode className="h-4.5 w-4.5 text-slate-400" />
                                    </div>

                                    <div>
                                      <h4 className="font-bold text-slate-900 leading-snug">{proj.title}</h4>
                                      <p className="text-xs text-slate-500 mt-1 lines-clamp-3">{proj.description}</p>
                                    </div>

                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">BRIDGED SKILLS</span>
                                      <div className="flex flex-wrap gap-1">
                                        {proj.bridgedSkills?.map((skill: string) => (
                                          <span key={skill} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Action items/Milestones */}
                                    <div className="border-t border-slate-100 pt-3">
                                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">PROJECT MILESTONES</span>
                                      <ul className="text-xs space-y-1.5 text-slate-600">
                                        {proj.milestones?.slice(0, 3).map((item: string, itemIdx: number) => (
                                          <li key={itemIdx} className="flex items-start space-x-1.5">
                                            <ChevronRight className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-100 pt-4 mt-4 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest block">DELIVERABLES</span>
                                    <p className="text-xs text-slate-800 font-medium">{proj.deliverables?.[0] || 'Fully documented codebase & deployment logs.'}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-4" id="empty-projects-view">
                          <p className="text-slate-500 text-sm">No custom tasks/projects scheduled. Press generate to create personalized recommendations based on your current gaps.</p>
                          <button onClick={() => triggerProjectRecommendations()} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-indigo-700">
                            Create Learning Project Specs
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Sub-tab View 4: INTERNSHIP MATCHING */}
                  {subTab === 'internships' && (
                    <div className="space-y-6" id="internships-sub-content">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Internship Portal Matching</h3>
                          <p className="text-slate-500 text-xs">Evaluates student parameters against live database listings, computing compatibility margins and resume triggers.</p>
                        </div>
                        <button 
                          onClick={triggerInternshipMatching}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition"
                          id="btn-rebuild-internships"
                        >
                          <ListRestart className="h-3.5 w-3.5" />
                          <span>Refresh Matches</span>
                        </button>
                      </div>

                      {internshipsData.length > 0 ? (
                        <div className="space-y-4" id="internships-loop">
                          {internshipsData.map((job) => {
                            const matchedSkills = profile.skills.filter(s => job.skillsRequired?.some((js: string) => js.toLowerCase() === s.toLowerCase()));
                            const score = job.matchScore !== undefined ? job.matchScore : 50;
                            const scoreBg = score >= 75 ? 'bg-emerald-500 text-emerald-100' : score >= 40 ? 'bg-amber-500 text-amber-100' : 'bg-slate-400 text-white';

                            return (
                              <div key={job.id} className="border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row gap-6 bg-white hover:border-indigo-100 hover:shadow-xs transition duration-150" id={`internship-item-${job.id}`}>
                                <div className="flex-1 space-y-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-base font-bold text-slate-900">{job.title}</h4>
                                    <span className="bg-slate-100 text-slate-600 font-semibold text-xs px-2.5 py-0.5 rounded-md">{job.company}</span>
                                    <span className="text-slate-400 text-xs">•</span>
                                    <span className="text-slate-500 text-xs">{job.location}</span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                                  <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                                    <div>
                                      <span className="text-slate-400 font-bold block mb-1">Required Competencies:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {job.skillsRequired?.map((skill: string) => (
                                          <span key={skill} className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-800">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <span className="text-slate-400 font-bold block mb-1">Your Alignments:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {matchedSkills.map((skill) => (
                                          <span key={skill} className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                                            {skill}
                                          </span>
                                        ))}
                                        {matchedSkills.length === 0 && <span className="text-[10px] text-slate-400">None matching</span>}
                                      </div>
                                    </div>
                                  </div>

                                  {job.matchExplanation && (
                                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xs text-slate-700 leading-relaxed mt-3" id="explanation-container">
                                      <span className="font-bold text-slate-800">Alfred Match Diagnosis: </span>{job.matchExplanation}
                                    </div>
                                  )}
                                </div>

                                <div className="md:width-[120px] shrink-0 flex flex-row md:flex-col justify-between items-center md:items-stretch border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6" id="job-meta-panel">
                                  <div className="text-center md:space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">MATCH SCORE</span>
                                    <span className={`inline-block font-mono text-xl font-bold px-3 py-1 rounded-full ${scoreBg}`}>
                                      {score}%
                                    </span>
                                  </div>

                                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition mt-auto w-full flex items-center justify-center space-x-1">
                                    <span>Apply Now</span>
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 space-y-4" id="empty-internship-view">
                          <p className="text-slate-500 text-sm">Internal internships index not matched. Press submit to compute alignment values for you.</p>
                          <button onClick={triggerInternshipMatching} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-indigo-700">
                            Perform Recruiting Matches
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Sub-tab View 5: RESUME REWRITING & ATS OPTIMIZATION */}
                  {subTab === 'resume' && (
                    <div className="space-y-6" id="resume-sub-content">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="text-lg font-bold text-slate-900">ATS Resume Optimizer</h3>
                        <p className="text-slate-500 text-xs">Critique formatting blocks, catch missing keywords relative to target job, and optimize your statements using the STAR framework.</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="resume-bento">
                        {/* Left Input panel (Plaintext editing) */}
                        <div className="lg:col-span-2 space-y-4" id="resume-input-panel">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resume Text Context</label>
                            <textarea
                              className="w-full h-80 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white leading-normal"
                              value={profile.resumeText}
                              onChange={(e) => setProfile({ ...profile, resumeText: e.target.value })}
                              placeholder="Paste resume content here for critique..."
                              id="resume-text-input"
                            />
                          </div>

                          <button 
                            onClick={triggerResumeCritique}
                            disabled={apiLoading}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition"
                            id="btn-trigger-resume-analysis"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Analyze Achievements</span>
                          </button>
                        </div>

                        {/* Right analysis panel */}
                        <div className="lg:col-span-3 space-y-6" id="resume-analysis-panel">
                          {resumeAnalysisData ? (
                            <div className="space-y-6" id="resume-results">
                              {/* Strengths & Missing keywords */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="resume-bento-sub">
                                <div className="border border-slate-150 rounded-xl p-4 bg-emerald-50/30 text-slate-800" id="resume-strengths">
                                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">Key Strengths Detected</h4>
                                  <ul className="space-y-1.5 text-xs">
                                    {resumeAnalysisData.strengths?.map((item: string, idx: number) => (
                                      <li key={idx} className="flex items-start space-x-1.5">
                                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50 text-slate-800" id="resume-missing-keywords">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Target Keywords Missing</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {resumeAnalysisData.missingKeywords?.map((kw: string) => (
                                      <span key={kw} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Technical Scores Category */}
                              <div className="space-y-3" id="scores-breakdown">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrics Categories</h4>
                                <div className="space-y-3" id="scores-loop">
                                  {resumeAnalysisData.impactScores?.map((cat: any, index: number) => (
                                    <div key={index} className="border border-slate-100 p-3 rounded-lg space-y-2 bg-slate-50" id={`score-container-${index}`}>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-800">{cat.category}</span>
                                        <span className="font-mono font-bold bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded text-indigo-700">{cat.score} / 100</span>
                                      </div>
                                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${cat.score}%` }}></div>
                                      </div>
                                      <p className="text-[11px] text-slate-500 italic">{cat.suggestion}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Formatting recommendations */}
                              <div className="space-y-2" id="resume-formatting-recs">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Layout Improvements</h4>
                                <ul className="space-y-1.5 text-xs">
                                  {resumeAnalysisData.actionableFormattingImprovements?.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-start space-x-1.5 text-slate-700">
                                      <span className="font-mono text-[10px] font-bold text-indigo-600 mt-0.5 px-1 bg-indigo-50 rounded">Step {idx + 1}</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Interactive STAR rewrites */}
                              <div className="border-t border-slate-100 pt-5 space-y-3" id="star-rewrites-block">
                                <h4 className="text-sm font-bold text-slate-900">STAR Accomplishments Optimized Suggestion</h4>
                                {resumeAnalysisData.enhancedBulletPoints?.map((bp: any, index: number) => (
                                  <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white shadow-xs" id={`star-item-${index}`}>
                                    <div className="space-y-1.5 text-xs">
                                      <span className="text-[10px] uppercase font-bold text-red-500 block">ORIGINAL COPY</span>
                                      <p className="text-slate-500 italic">"{bp.original}"</p>
                                    </div>
                                    <div className="space-y-1.5 text-xs border-l-2 border-emerald-500 pl-3">
                                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">ALFRED REWRITE</span>
                                      <p className="text-slate-800 font-medium">"{bp.improved}"</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-600">
                                      <span className="font-bold">ATS Value: </span>{bp.explanation}
                                    </div>
                                    <button
                                      onClick={() => handleCopyText(bp.improved, `rewrite-${index}`)}
                                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                                      id={`copy-star-${index}`}
                                    >
                                      {copiedFile === `rewrite-${index}` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                      <span>{copiedFile === `rewrite-${index}` ? 'Copied' : 'Copy Rewrite'}</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-400" id="empty-resume">
                              <FileText className="h-10 w-10 text-slate-300 mb-2" />
                              <p className="text-xs">Provide a career resume text on the left and trigger audit analysis.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB 2: MCP Server Files (Explore, Copy content files) */}
            {activeTab === 'mcp-files' && (
              <div className="space-y-6" id="mcp-server-files-tab-view">
                <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6" id="mcp-banner">
                  <div className="space-y-2">
                    <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-indigo-400/20">
                      Model Context Protocol SDK
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight">FastMCP Python Servers Desk</h2>
                    <p className="text-slate-400 text-xs max-w-xl">
                      Expose roadmaps, skill gaps, and CV critiques directly to Gemini, Claude, Cursor, and Windsurf. Inspect and copy each file's exact contents instantly.
                    </p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button 
                      onClick={() => handleCopyText(getSelectedFileCode(), 'active-code')}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 shadow-sm transition"
                      id="btn-copy-template-text"
                    >
                      {copiedFile === 'active-code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span>{copiedFile === 'active-code' ? 'Copied Content' : 'Copy Absolute File'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="mcp-files-layout">
                  {/* Files Selection Sidebar directory */}
                  <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-xs" id="mcp-file-list-tab">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wilder mb-3 px-2">Project Folder</h3>
                    <nav className="space-y-1" id="mcp-files-nested">
                      {/* Section 1: Python MCP logic */}
                      <span className="block text-[10px] font-bold text-slate-400 px-2 pt-2 pb-1">PYTHON SOURCE</span>
                      {pythonTemplates.map((item) => (
                        <button
                          key={item.fileName}
                          onClick={() => setSelectedMcpFile(item.fileName)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                            selectedMcpFile === item.fileName
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                          id={`mcp-btn-${item.fileName}`}
                        >
                          <FileCode className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span className="truncate">{item.fileName}</span>
                        </button>
                      ))}

                      {/* Section 2: Datasets JSON */}
                      <span className="block text-[10px] font-bold text-slate-400 px-2 pt-4 pb-1">JSON DATABASES</span>
                      {datasetTemplates.map((item) => (
                        <button
                          key={item.fileName}
                          onClick={() => setSelectedMcpFile(item.fileName)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                            selectedMcpFile === item.fileName
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                          id={`mcp-btn-${item.fileName}`}
                        >
                          <Database className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span className="truncate">{item.fileName}</span>
                        </button>
                      ))}
                    </nav>

                    <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500 px-1" id="fastmcp-instruction">
                      <span className="font-bold text-slate-800 block mb-1">Architecture Note:</span>
                      Each dataset represents career catalogs queried by Python FastMCP. You can integrate this with your personal LLM IDE and configure database rules.
                    </div>
                  </div>

                  {/* Code Editor Viewport */}
                  <div className="lg:col-span-3 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-xs" id="code-viewport">
                    <div className="bg-slate-50 border-b border-slate-150 px-4 py-3 flex items-center justify-between" id="code-header">
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-700" id="file-title-display">
                        <FolderOpen className="h-4 w-4 text-slate-400" />
                        <span>Alfred-Atlas / {selectedMcpFile}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">
                        {selectedMcpFile.endsWith('.py') ? 'Python' : 'JSON Schema'}
                      </span>
                    </div>

                    <div className="overflow-x-auto" id="prism-codearea-container">
                      <pre className="p-5 overflow-auto text-xs font-mono text-slate-850 h-[480px] bg-slate-900 text-indigo-100 selection:bg-slate-800 leading-relaxed" id="canvas-codearea">
                        <code>{getSelectedFileCode()}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MCP Client Configuration Guides */}
            {activeTab === 'mcp-config' && (
              <div className="space-y-6" id="mcp-config-tab-view">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="mcp-config-setup">
                  <div className="border-b border-slate-100 pb-4 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Configuring MCP Workspace Clients</h3>
                    <p className="text-slate-500 text-xs">Expose these tools to your local AI helpers. Map the environment variables and boot commands effortlessly.</p>
                  </div>

                  <div className="space-y-8" id="platform-guides">
                    {/* Platform 1: Cursor / Windsurf Setup */}
                    <div className="space-y-4" id="cursor-setup-block">
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs font-mono">1</span>
                        <h4 className="font-bold text-slate-950 text-sm">Cursor IDE / Windsurf setup</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To add Alfred's MCP server directly inside Cursor, navigate to <strong>Settings &gt; Features &gt; MCP</strong>, click <strong>+ Add New MCP Server</strong>, and configure with these parameters:
                      </p>

                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3" id="cursor-block-config">
                        <table className="text-xs w-full text-slate-800 border-collapse">
                          <tbody>
                            <tr className="border-b border-slate-200/50">
                              <td className="py-2 font-bold text-slate-500 w-32">Name</td>
                              <td className="py-2 font-mono text-indigo-700">Alfred-Atlas</td>
                            </tr>
                            <tr className="border-b border-slate-200/50">
                              <td className="py-2 font-bold text-slate-500 w-32">Type</td>
                              <td className="py-2 font-mono text-slate-600">command</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-bold text-slate-500 w-32">Command</td>
                              <td className="py-2">
                                <code className="block bg-slate-900 text-indigo-200 font-mono text-[10px] p-2.5 rounded-lg border border-slate-800">
                                  uv run mcp-server-dev --api-key YOUR_GEMINI_KEY src/app.py
                                </code>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Platform 2: Claude Desktop Configuration */}
                    <div className="space-y-4" id="claude-desktop-block">
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center text-xs font-mono">2</span>
                        <h4 className="font-bold text-slate-950 text-sm">Claude Desktop Integration</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        To integrate Alfred Atlas directly with the official Claude Desktop client system, navigate to your computer's configuration directory and append the fastmcp entry as shown in your <code>claude_desktop_config.json</code>:
                      </p>

                      <div className="space-y-2" id="claude-config-interactive">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Configuration Location: <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></span>
                          <button
                            onClick={() => handleCopyText(`{\n  "mcpServers": {\n    "alfred-atlas": {\n      "command": "python",\n      "args": [\n        "/absolute/path/to/alfred-atlas/app.py"\n      ],\n      "env": {\n        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"\n      }\n    }\n  }\n}`, 'claude-json')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                            id="btn-copy-claude-json"
                          >
                            {copiedFile === 'claude-json' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedFile === 'claude-json' ? 'Copied' : 'Copy JSON'}</span>
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-indigo-200 text-xs font-mono p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800" id="claude-json-snippet">
{`{
  "mcpServers": {
    "alfred-atlas": {
      "command": "python",
      "args": [
        "/absolute/path/to/alfred-atlas/app.py"
      ],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GitHub Push Desk Helper */}
            {activeTab === 'github' && (
              <div className="space-y-6" id="github-tab-view">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="github-box">
                  <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">GitHub Workspace Push Desk</h3>
                      <p className="text-slate-500 text-xs">Prepare, stage, commit, and sync your dynamic Alfred Atlas applet and python MCP stack to GitHub.</p>
                    </div>
                    <Github className="h-7 w-7 text-slate-400" />
                  </div>

                  {/* Custom Configuration Input Bar to generate matching terminal directions */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" id="git-user-inputs">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="git-user-input">GitHub Username / Organization</label>
                      <input
                        id="git-user-input"
                        type="text"
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={gitUsername}
                        onChange={(e) => setGitUsername(e.target.value)}
                        placeholder="e.g., yashraj-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1" htmlFor="git-repo-input">Repository Directory Name</label>
                      <input
                        id="git-repo-input"
                        type="text"
                        className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={gitRepoName}
                        onChange={(e) => setGitRepoName(e.target.value)}
                        placeholder="e.g., alfred-atlas"
                      />
                    </div>
                  </div>

                  <div className="space-y-4" id="terminal-guide-checklist">
                    <h4 className="text-sm font-bold text-slate-900">Executable Terminal Commands Configuration</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Copy down these command workflows to initialize git locally, commit files securely, and upload them to your GitHub profile.
                    </p>

                    {/* Code block outputting computed git scripts */}
                    <div className="space-y-2" id="git-computed-terminal">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Workflow Target: <code>https://github.com/{gitUsername}/{gitRepoName}.git</code></span>
                        <button
                          onClick={() => {
                            const cmd = `# 1. Initialize Git repository locally\ngit init\n\n# 2. Stage All Application Files & MCP Python modules\ngit add .\n\n# 3. Create initial structural commit\ngit commit -m "feat: bootstrap alfred atlas Career Navigator & FastMCP Server"\n\n# 4. Configure master tracking branch\ngit branch -M main\n\n# 5. Link GitHub absolute origin\ngit remote add origin https://github.com/${gitUsername}/${gitRepoName}.git\n\n# 6. Push staging artifacts safely\ngit push -u origin main`;
                            handleCopyText(cmd, 'git-terminal');
                            setCopiedGitCmd(true);
                            setTimeout(() => setCopiedGitCmd(false), 2000);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1"
                          id="btn-copy-git-text"
                        >
                          {copiedGitCmd ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedGitCmd ? 'Copied script' : 'Copy Entire Git Script'}</span>
                        </button>
                      </div>

                      <pre className="bg-slate-900 text-indigo-200 text-xs font-mono p-5 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800" id="canvas-git-code">
{`# 1. Initialize Git repository locally
git init

# 2. Stage All Application Files & MCP Python modules
git add .

# 3. Create initial structural commit
git commit -m "feat: bootstrap alfred atlas Career Navigator & FastMCP Server"

# 4. Configure master tracking branch
git branch -M main

# 5. Link GitHub absolute origin
git remote add origin https://github.com/${gitUsername}/${gitRepoName}.git

# 6. Push staging artifacts safely
git push -u origin main`}
                      </pre>
                    </div>

                    {/* Helpful companion tip */}
                    <div className="bg-slate-50 border border-slate-250 p-4 rounded-xl space-y-2 mt-4" id="git-security-tip">
                      <h5 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                        <Info className="h-4 w-4 text-indigo-500" />
                        <span>Security Check & Environment Warnings</span>
                      </h5>
                      <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                        <li>Make sure your <code>.gitignore</code> lists your local <code>.env</code> file or actual API credentials to prevent leaks.</li>
                        <li>Do not hardcode your <code>GEMINI_API_KEY</code> into the Python code assets. Always extract it via <code>os.environ.get("GEMINI_API_KEY")</code>!</li>
                        <li>Verify credentials before completing the final repository publish.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Persistent global footer */}
      <footer className="bg-white border-t border-slate-200 mt-20" id="global-doc-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4" id="footer-inner-block">
          <div>
            <p>Alfred Atlas Career Ecosystem Applet © 2026. Made with Google AI Studio.</p>
          </div>
          <div className="flex space-x-4" id="footer-links">
            <span className="hover:text-slate-800">MCP FastMCP Python Library</span>
            <span>•</span>
            <span className="hover:text-slate-800">Careers API Documentation</span>
            <span>•</span>
            <span className="hover:text-slate-800 font-semibold text-indigo-600 cursor-pointer" onClick={() => setActiveTab('mcp-config')}>Setup Help</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
