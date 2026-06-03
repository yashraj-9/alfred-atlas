/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SkillGapAnalysis {
  role: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: {
    skill: string;
    importance: 'High' | 'Medium' | 'Low';
    description: string;
  }[];
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  skillsRequired: string[];
  description: string;
  matchScore?: number;
  matchExplanation?: string;
}

export interface CareerRoadmap {
  role: string;
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
    resources: string[];
    gainedSkills: string[];
  }[];
}

export interface ProjectRecommendation {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  bridgedSkills: string[];
  milestones: string[];
  deliverables: string[];
}

export interface ResumeAnalysis {
  strengths: string[];
  missingKeywords: string[];
  impactScores: {
    category: string;
    score: number; // 0-100
    suggestion: string;
  }[];
  actionableFormattingImprovements: string[];
  enhancedBulletPoints: {
    original: string;
    improved: string;
    explanation: string;
  }[];
}

export interface McpToolConfig {
  name: string;
  description: string;
  fileName: string;
  code: string;
}

export interface DatasetConfig {
  name: string;
  fileName: string;
  content: string;
}
