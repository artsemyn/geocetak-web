// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types based on new schema from datastructure.json

// Activity Log table
export interface ActivityLog {
  id: string
  user_id: string
  activity_type: string
  entity_type: string | null
  entity_id: string | null
  metadata: any | null
  created_at: string
}

// Assignment Submissions table
export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  submission_text: string | null
  submission_files: any | null
  submitted_at: string
  status: string
  score: number | null
  ai_feedback: any | null
  teacher_feedback: string | null
  teacher_override_score: number | null
  graded_at: string | null
  graded_by: string | null
  updated_at: string
}

// Assignments table
export interface Assignment {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  description: string | null
  module_id: string | null
  lesson_id: string | null
  assignment_type: string
  due_date: string | null
  max_score: number
  rubric: any | null
  is_published: boolean
  created_at: string
  updated_at: string
}

// Badges table
export interface Badge {
  id: string
  slug: string
  name: string
  description: string | null
  icon_url: string | null
  requirement_type: string
  requirement_value: number | null
  created_at: string
}

// Classroom Members table
export interface ClassroomMember {
  id: string
  classroom_id: string
  student_id: string
  joined_at: string
}

// Classrooms table
export interface Classroom {
  id: string
  teacher_id: string
  name: string
  description: string | null
  class_code: string
  school_name: string | null
  grade_level: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Export Jobs table
export interface ExportJob {
  id: string
  user_id: string
  source_model_path: string
  status: string
  stl_file_url: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
  updated_at: string
}

// Gamification table
export interface Gamification {
  id: string
  user_id: string
  total_xp: number
  level: number
  current_streak_days: number
  longest_streak_days: number
  last_activity_date: string | null
  badges_earned: any | null
  created_at: string
  updated_at: string
}

// Lessons table
export interface Lesson {
  id: string
  module_id: string
  slug: string
  title: string
  lesson_type: string
  order_index: number
  content_markdown: string | null
  video_url: string | null
  scene_config: any | null
  estimated_duration_minutes: number | null
  xp_reward: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// 3D Models table
export interface Model3D {
  id: string
  module_id: string | null
  name: string
  description: string | null
  glb_file_path: string
  thumbnail_url: string | null
  file_size_bytes: number | null
  is_template: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// Modules table
export interface Module {
  id: string
  slug: string
  title: string
  description: string | null
  icon_url: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// Profiles table (extends Supabase auth.users)
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: string
  school_name: string | null
  grade_level: string | null
  created_at: string
  updated_at: string
}

// Quiz Attempts table
export interface QuizAttempt {
  id: string
  user_id: string
  lesson_id: string
  answers: any
  score: number | null
  max_score: number | null
  time_spent_seconds: number | null
  started_at: string
  completed_at: string | null
  created_at: string
}

// Quiz Questions table
export interface QuizQuestion {
  id: string
  lesson_id: string
  question_text: string
  question_type: string
  options: any | null
  correct_answer: string | null
  explanation: string | null
  difficulty: string
  points: number
  order_index: number
  created_at: string
  updated_at: string
}

// Student Progress table
export interface StudentProgress {
  id: string
  user_id: string
  lesson_id: string
  status: string
  completion_percentage: number
  quiz_score: number | null
  time_spent_seconds: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

// For backward compatibility and computed user stats
export interface UserStats {
  id: string
  total_xp: number
  level: number
  badges: Badge[]
  streak_days: number
  last_activity: string
  modules_completed?: number
  lessons_completed?: number
}

// Legacy interface aliases for backward compatibility
export interface Student extends Profile {
  xp_points?: number
  total_badges?: number
  streak_days?: number
  last_activity_date?: string
  status?: string
  nis?: string
  class_id?: string
  teacher_id?: string
}

export interface Achievement extends Badge {}
export interface StudentAchievement {
  id: string
  student_id: string
  achievement_id: string
  earned_at: string
}
export interface LessonCompletion extends StudentProgress {}
export interface ModelExport extends ExportJob {}
export interface PracticeQuestion extends QuizQuestion {}
export interface StudentQuestionAttempt extends QuizAttempt {}
export interface PracticeSession extends QuizAttempt {}
export interface Teacher extends Profile {}
export interface Class extends Classroom {}
export interface ClassStudent extends ClassroomMember {}
export interface ProblemAttempt extends QuizAttempt {}