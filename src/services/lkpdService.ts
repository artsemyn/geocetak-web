// src/services/lkpdService.ts

import { supabase } from './supabase';
import type { 
  LKPDWorksheet, 
  LKPDSubmission, 
  SectionResponse,
  CapturedParameters 
} from '../types/lkpd';

// ========================================
// WORKSHEET OPERATIONS
// ========================================

/**
 * Fetch LKPD worksheet by assignment ID
 */
export async function getWorksheet(assignmentId: string): Promise<LKPDWorksheet | null> {
  const { data, error } = await supabase
    .from('lkpd_worksheets')
    .select('*')
    .eq('assignment_id', assignmentId)
    .single();
  
  if (error) {
    console.error('Error fetching worksheet:', error);
    return null;
  }
  
  return data;
}

/**
 * Create new LKPD worksheet
 */
export async function createWorksheet(
  worksheet: Omit<LKPDWorksheet, 'id' | 'created_at' | 'updated_at'>
): Promise<LKPDWorksheet | null> {
  const { data, error } = await supabase
    .from('lkpd_worksheets')
    .insert(worksheet)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating worksheet:', error);
    return null;
  }
  
  return data;
}

// ========================================
// SUBMISSION OPERATIONS
// ========================================

/**
 * Get or create submission for student
 */
export async function getOrCreateSubmission(
  assignmentId: string,
  studentId: string
): Promise<LKPDSubmission | null> {
  // Try to get existing submission
  let { data: existing, error: fetchError } = await supabase
    .from('lkpd_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .single();
  
  if (existing) {
    return existing;
  }
  
  // Create new submission if doesn't exist
  const { data: newSubmission, error: createError } = await supabase
    .from('lkpd_submissions')
    .insert({
      assignment_id: assignmentId,
      student_id: studentId,
      section_responses: {},
      current_section: 0,
      completed_sections: [],
      status: 'draft'
    })
    .select()
    .single();
  
  if (createError) {
    console.error('Error creating submission:', createError);
    return null;
  }
  
  return newSubmission;
}

/**
 * Save section response (auto-save)
 */
export async function saveSectionResponse(
  submissionId: string,
  sectionIndex: number,
  response: SectionResponse
): Promise<boolean> {
  // Get current submission
  const { data: submission } = await supabase
    .from('lkpd_submissions')
    .select('section_responses, completed_sections')
    .eq('id', submissionId)
    .single();
  
  if (!submission) return false;
  
  // Update section responses
  const updatedResponses = {
    ...submission.section_responses,
    [`section_${sectionIndex}`]: response
  };
  
  // Update in database
  const { error } = await supabase
    .from('lkpd_submissions')
    .update({
      section_responses: updatedResponses,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId);
  
  if (error) {
    console.error('Error saving section:', error);
    return false;
  }
  
  return true;
}

/**
 * Mark section as completed
 */
export async function markSectionComplete(
  submissionId: string,
  sectionIndex: number
): Promise<boolean> {
  // Get current completed sections
  const { data: submission } = await supabase
    .from('lkpd_submissions')
    .select('completed_sections')
    .eq('id', submissionId)
    .single();
  
  if (!submission) return false;
  
  // Add to completed if not already there
  const completedSections = submission.completed_sections || [];
  if (!completedSections.includes(sectionIndex)) {
    completedSections.push(sectionIndex);
    completedSections.sort((a, b) => a - b);
  }
  
  // Update database
  const { error } = await supabase
    .from('lkpd_submissions')
    .update({ completed_sections: completedSections })
    .eq('id', submissionId);
  
  return !error;
}

/**
 * Update current section
 */
export async function updateCurrentSection(
  submissionId: string,
  sectionIndex: number
): Promise<boolean> {
  const { error } = await supabase
    .from('lkpd_submissions')
    .update({ current_section: sectionIndex })
    .eq('id', submissionId);
  
  return !error;
}

/**
 * Submit LKPD for review
 */
export async function submitLKPD(submissionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('lkpd_submissions')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .eq('id', submissionId);
  
  if (error) {
    console.error('Error submitting LKPD:', error);
    return false;
  }
  
  // TODO: Trigger AI feedback generation (will implement in Day 3)
  // await generateAIFeedback(submissionId);
  
  return true;
}

// ========================================
// DATA CAPTURE UTILITIES
// ========================================

/**
 * Capture 3D parameters from geometry controller
 */
export function captureParameters(geometryState: any): CapturedParameters {
  const { type, dimensions } = geometryState;
  
  // Calculate surface area and volume based on type
  const params: CapturedParameters = {
    geometry_type: type,
    captured_at: new Date().toISOString()
  };
  
  if (type === 'cylinder') {
    const { radius, height } = dimensions;
    params.radius = radius;
    params.height = height;
    params.surface_area = 2 * Math.PI * radius * (radius + height);
    params.volume = Math.PI * radius * radius * height;
  } else if (type === 'cone') {
    const { radius, height } = dimensions;
    const slantHeight = Math.sqrt(radius * radius + height * height);
    params.radius = radius;
    params.height = height;
    params.slant_height = slantHeight;
    params.surface_area = Math.PI * radius * (radius + slantHeight);
    params.volume = (1/3) * Math.PI * radius * radius * height;
  } else if (type === 'sphere') {
    const { radius } = dimensions;
    params.radius = radius;
    params.surface_area = 4 * Math.PI * radius * radius;
    params.volume = (4/3) * Math.PI * radius * radius * radius;
  }
  
  return params;
}

/**
 * Capture screenshot from canvas
 */
export async function captureScreenshot(userId: string): Promise<string | null> {
  try {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      throw new Error('No canvas found');
    }
    
    // Convert canvas to blob
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    
    // Generate filename
    const filename = `screenshot_${Date.now()}.png`;
    const filepath = `${userId}/${filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('lkpd-screenshots')
      .upload(filepath, blob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading screenshot:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('lkpd-screenshots')
      .getPublicUrl(filepath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

// ========================================
// TEACHER OPERATIONS
// ========================================

/**
 * Get all submissions for an assignment
 */
export async function getSubmissionsByAssignment(
  assignmentId: string
): Promise<LKPDSubmission[]> {
  const { data, error } = await supabase
    .from('lkpd_submissions')
    .select(`
      *,
      student:profiles!student_id(id, full_name, email)
    `)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Add teacher feedback
 */
export async function addTeacherFeedback(
  submissionId: string,
  feedback: string,
  score?: number
): Promise<boolean> {
  const updates: any = {
    teacher_feedback: feedback,
    status: 'reviewed',
    reviewed_at: new Date().toISOString()
  };
  
  if (score !== undefined) {
    updates.score = score;
  }
  
  const { error } = await supabase
    .from('lkpd_submissions')
    .update(updates)
    .eq('id', submissionId);
  
  if (error) {
    console.error('Error adding teacher feedback:', error);
    return false;
  }
  
  return true;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate LKPD progress percentage
 */
export function calculateProgress(
  totalSections: number,
  completedSections: number[]
): number {
  if (totalSections === 0) return 0;
  return Math.round((completedSections.length / totalSections) * 100);
}

/**
 * Check if section is completed
 */
export function isSectionCompleted(
  sectionIndex: number,
  completedSections: number[]
): boolean {
  return completedSections.includes(sectionIndex);
}

/**
 * Validate section response before saving
 */
export function validateSectionResponse(
  section: any,
  response: SectionResponse
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (section.type === 'observation') {
    const obsResponse = response as any;
    if (!obsResponse.rows || obsResponse.rows.length === 0) {
      errors.push('Tabel pengamatan belum diisi');
    }
  }
  
  if (section.type === 'analysis') {
    const analysisResponse = response as any;
    const answeredQuestions = Object.keys(analysisResponse).length;
    if (answeredQuestions === 0) {
      errors.push('Belum ada pertanyaan yang dijawab');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}