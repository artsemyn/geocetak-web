// src/types/lkpd.ts

import type { Assignment, Profile } from './index';

// ========================================
// LKPD Section Types
// ========================================

export interface BaseSection {
  type: string;
  title: string;
}

export interface IntroSection extends BaseSection {
  type: 'intro';
  content: string; // Markdown content
}

export interface ActivitySection extends BaseSection {
  type: 'activity';
  steps: string[];
  requires_3d: boolean;
  capture_parameters?: string[]; // e.g., ['radius', 'height']
  instruction?: string;
}

export interface ObservationSection extends BaseSection {
  type: 'observation';
  instruction?: string;
  table_headers: string[];
  rows: number;
  auto_calculate?: boolean;
  example_row?: Record<string, string>;
}

export interface AnalysisSection extends BaseSection {
  type: 'analysis';
  questions: AnalysisQuestion[];
}

export interface AnalysisQuestion {
  id: string;
  question: string;
  hint?: string;
  type: 'essay' | 'short_answer';
}

export interface ConclusionSection extends BaseSection {
  type: 'conclusion';
  prompt: string;
}

export type LKPDSection = 
  | IntroSection 
  | ActivitySection 
  | ObservationSection 
  | AnalysisSection 
  | ConclusionSection;

// ========================================
// LKPD Worksheet
// ========================================

export interface MaterialsNeeded {
  virtual: string[];
  physical?: string[];
}

export interface LKPDRubric {
  [criterionKey: string]: {
    weight: number;
    criteria: string;
  };
}

export interface LKPDWorksheet {
  id: string;
  assignment_id: string;
  title: string;
  description?: string;
  geometry_type: 'cylinder' | 'cone' | 'sphere';
  estimated_minutes: number;
  learning_objectives: string[];
  materials_needed: MaterialsNeeded;
  sections: LKPDSection[];
  rubric?: LKPDRubric;
  created_at: string;
  updated_at: string;
}

// ========================================
// LKPD Submission Responses
// ========================================

export interface ActivityResponse {
  parameters_used?: Record<string, number>;
  screenshot_url?: string;
  observations?: string;
  completed_steps?: number[];
}

export interface ObservationResponse {
  rows: Record<string, any>[];
}

export interface AnalysisResponse {
  [questionId: string]: {
    answer: string;
    hints_used?: string[];
  };
}

export interface ConclusionResponse {
  formula?: string;
  explanation?: string;
  reflection?: string;
}

export type SectionResponse = 
  | ActivityResponse 
  | ObservationResponse 
  | AnalysisResponse 
  | ConclusionResponse;

export interface SectionResponses {
  [sectionKey: string]: SectionResponse;
}

// ========================================
// LKPD Submission
// ========================================

export type LKPDStatus = 'draft' | 'submitted' | 'reviewed';

export interface AIFeedback {
  overall_feedback: string;
  strengths: string[];
  suggestions: Array<{
    section: string;
    feedback: string;
  }>;
  next_steps?: string[];
}

export interface LKPDSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  section_responses: SectionResponses;
  current_section: number;
  completed_sections: number[];
  ai_feedback?: AIFeedback;
  teacher_feedback?: string;
  status: LKPDStatus;
  score?: number;
  started_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  student?: Profile;
  assignment?: Assignment;
}

// ========================================
// Helper Types
// ========================================

export interface LKPDProgress {
  total_sections: number;
  completed_sections: number;
  current_section: number;
  percentage: number;
}

export interface CapturedParameters {
  geometry_type: string;
  radius?: number;
  height?: number;
  slant_height?: number;
  surface_area?: number;
  volume?: number;
  captured_at: string;
}

// ========================================
// Type Guards
// ========================================

export function isActivitySection(section: LKPDSection): section is ActivitySection {
  return section.type === 'activity';
}

export function isObservationSection(section: LKPDSection): section is ObservationSection {
  return section.type === 'observation';
}

export function isAnalysisSection(section: LKPDSection): section is AnalysisSection {
  return section.type === 'analysis';
}

export function isConclusionSection(section: LKPDSection): section is ConclusionSection {
  return section.type === 'conclusion';
}

export function isLKPDAssignment(assignment: Assignment): boolean {
  return assignment.assignment_type === 'lkpd';
}