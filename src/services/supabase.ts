// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types based on actual schema

// Auth Profile (using Supabase auth.users)
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

// Teachers table
export interface Teacher {
  id: number
  name: string
  email: string
  password: string
  school_name: string
  phone: string | null
  created_at: string
  updated_at: string
}

// Students table
export interface Student {
  id: number
  name: string
  email: string | null
  nis: string | null
  class_id: number | null
  teacher_id: number
  xp_points: number | null
  total_badges: number | null
  streak_days: number | null
  last_activity_date: string | null
  status: string | null
  created_at: string
  updated_at: string
}

// Classes table
export interface Class {
  id: number
  name: string
  teacher_id: number
  academic_year: string
  grade_level: number
  max_capacity: number | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

// Class Students junction table
export interface ClassStudent {
  id: number
  class_id: number
  student_id: number
  enrollment_date: string | null
  is_active: boolean | null
}

// Modules table
export interface Module {
  id: number
  name: string
  slug: string
  description: string | null
  icon_url: string | null
  order_index: number
  is_published: boolean | null
  xp_reward: number | null
  created_at: string
  updated_at: string
}

// Lessons table
export interface Lesson {
  id: number
  module_id: number
  title: string
  slug: string
  order_index: number
  lesson_type: string
  content_data: any | null
  interactive_config: any | null
  xp_reward: number | null
  estimated_duration: number | null
  is_published: boolean | null
  created_at: string
  updated_at: string
}

// Student Progress table
export interface StudentProgress {
  id: number
  student_id: number
  module_id: number
  current_lesson_id: number | null
  progress_percentage: number | null
  total_xp_earned: number | null
  time_spent: number | null
  last_accessed_at: string | null
  created_at: string
  updated_at: string
}

// Lesson Completions table
export interface LessonCompletion {
  id: number
  student_id: number
  lesson_id: number
  completed_at: string | null
  time_spent: number
  score: number | null
  xp_earned: number | null
  completion_data: any | null
}

// Assignments table
export interface Assignment {
  id: number
  title: string
  description: string | null
  class_id: number
  teacher_id: number
  deadline: string
  status: string
  resources: any | null
  created_at: string
  updated_at: string
}

// Achievements table
export interface Achievement {
  id: number
  name: string
  description: string | null
  badge_icon_url: string | null
  criteria_type: string
  criteria_value: number | null
  xp_reward: number | null
  created_at: string
}

// Student Achievements table
export interface StudentAchievement {
  id: number
  student_id: number
  achievement_id: number
  earned_at: string | null
}

// Problem Attempts table
export interface ProblemAttempt {
  id: number
  student_id: number
  lesson_id: number
  problem_data: any
  student_answer: string | null
  is_correct: boolean | null
  ai_feedback: string | null
  ai_score: number | null
  attempt_number: number | null
  attempted_at: string | null
}

// Model Exports table
export interface ModelExport {
  id: number
  student_id: number
  lesson_id: number | null
  model_type: string
  model_parameters: any | null
  glb_file_url: string | null
  stl_file_url: string | null
  export_status: string | null
  created_at: string
}

// For backward compatibility and computed user stats
export interface UserStats {
  id: string | number
  total_xp: number
  level: number
  badges: Achievement[]
  streak_days: number
  last_activity: string
  modules_completed?: number
  lessons_completed?: number
}