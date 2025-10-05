// src/services/assignmentService.ts
import { supabase, Assignment, AssignmentSubmission } from './supabase'

export interface AssignmentSubmissionData {
  assignmentId: string
  studentId: string
  submissionText?: string
  submissionFiles?: any[]
}

/**
 * Fetch assignments for a specific lesson
 */
export async function getAssignmentsByLesson(lessonId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assignments by lesson:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch assignments for a specific module
 */
export async function getAssignmentsByModule(moduleId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('module_id', moduleId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assignments by module:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific assignment by ID
 */
export async function getAssignmentById(assignmentId: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching assignment:', error)
    throw error
  }

  return data || null
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  submissionData: AssignmentSubmissionData
): Promise<AssignmentSubmission> {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert({
      assignment_id: submissionData.assignmentId,
      student_id: submissionData.studentId,
      submission_text: submissionData.submissionText,
      submission_files: submissionData.submissionFiles || [],
      submitted_at: new Date().toISOString(),
      status: 'submitted'
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting assignment:', error)
    throw error
  }

  return data
}

/**
 * Update an existing submission
 */
export async function updateAssignmentSubmission(
  submissionId: string,
  submissionData: Partial<AssignmentSubmissionData>
): Promise<AssignmentSubmission> {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .update({
      submission_text: submissionData.submissionText,
      submission_files: submissionData.submissionFiles,
      updated_at: new Date().toISOString()
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating assignment submission:', error)
    throw error
  }

  return data
}

/**
 * Get student's submission for a specific assignment
 */
export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<AssignmentSubmission | null> {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching student submission:', error)
    throw error
  }

  return data || null
}

/**
 * Get all submissions for a student
 */
export async function getStudentSubmissions(studentId: string): Promise<AssignmentSubmission[]> {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      assignments (
        title,
        description,
        max_score,
        due_date
      )
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching student submissions:', error)
    throw error
  }

  return data || []
}

/**
 * Check if assignment is overdue
 */
export function isAssignmentOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

/**
 * Get assignment status for a student
 */
export async function getAssignmentStatus(
  assignmentId: string,
  studentId: string
): Promise<'not_started' | 'in_progress' | 'submitted' | 'graded'> {
  const submission = await getStudentSubmission(assignmentId, studentId)

  if (!submission) return 'not_started'
  if (submission.graded_at) return 'graded'
  if (submission.submitted_at) return 'submitted'
  return 'in_progress'
}
