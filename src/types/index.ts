// src/types/index.ts

// Database Types (matching new Supabase schema from datastructure.json)
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
  // Computed content property for backward compatibility
  content?: LessonContent | null
}

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

// Content Types - Updated for tab-based lessons
export interface LessonContent {
  concept?: TabContent
  net?: TabContent
  formula?: TabContent
  quiz?: TabContent
}

export interface TabContent {
  title: string
  content: string
  elements?: ContentElement[]
  interactive_config?: Record<string, any>
}

export interface ContentElement {
  type: 'text' | 'alert' | 'card' | 'list' | 'formula' | 'interactive'
  title?: string
  content: string
  props?: Record<string, any>
}

export interface ContentSection {
  type: 'text' | 'video' | 'interactive' | 'formula' | '3d-model'
  title: string
  content: string
  metadata?: Record<string, any>
}

export interface Activity {
  id: string
  type: 'quiz' | 'interactive-3d' | 'net-animation' | 'formula-discovery' | 'problem-solving'
  title: string
  description: string
  config: ActivityConfig
}

export interface ActivityConfig {
  // For 3D activities
  geometry?: GeometryType
  parameters?: GeometryParameters
  
  // For quiz activities
  questions?: Question[]
  
  // For problem solving
  problems?: Problem[]
}

export interface Question {
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
  // Legacy properties for backward compatibility
  type?: 'multiple-choice' | 'true-false' | 'fill-in' | 'essay'
  question?: string
}

export interface Problem {
  id: string
  title: string
  description: string
  given_data: Record<string, number>
  required_answer: string
  solution_steps: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Assessment {
  type: 'quiz' | 'project' | 'essay'
  passing_score: number
  max_attempts: number
  time_limit?: number // in minutes
  questions: Question[]
}

// Geometry Types
export type GeometryType = 'cylinder' | 'cone' | 'sphere' | 'cube' | 'rectangular-prism' | 'triangular-prism' | 'pyramid'

export interface GeometryParameters {
  radius: number
  height: number
  slantHeight?: number // for cone
  width?: number // for rectangular prism
  depth?: number // for rectangular prism
  length?: number // for triangular prism
  baseWidth?: number // for pyramid
  baseLength?: number // for pyramid
  // Add more parameters as needed
}

export interface GeometryCalculations {
  surfaceArea: number
  volume: number
  netComponents: NetComponent[]
}

export interface NetComponent {
  type: 'circle' | 'rectangle' | 'triangle' | 'sector'
  dimensions: Record<string, number>
  position: [number, number, number]
  label: string
}

// Gamification Types
export interface Badge {
  id: string
  slug: string
  name: string
  description: string | null
  icon_url: string | null
  requirement_type: string
  requirement_value: number | null
  created_at: string
  earned_at?: string
  category?: 'learning' | 'achievement' | 'streak' | 'social'
}

export interface Achievement extends Badge {}

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

export interface AchievementCondition {
  type: 'complete_lessons' | 'earn_xp' | 'maintain_streak' | 'perfect_score' | 'time_spent'
  value: number
  scope?: 'lesson' | 'module' | 'global'
}

export interface AchievementReward {
  xp: number
  badges: string[]
  title?: string
}

// UI/UX Types
export interface ThemePalette {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: string
  requiresAuth: boolean
  children?: NavigationItem[]
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  success: boolean
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Store Types
export interface AuthState {
  user: any | null // Supabase User type
  profile: Profile | null
  student?: Student | null // For backward compatibility
  loading: boolean
}

export interface LearningState {
  modules: Module[]
  currentModule: Module | null
  lessons: Lesson[]
  currentLesson: Lesson | null
  progress: StudentProgress[]
  userStats: UserStats | null
  currentStudent?: Student | null // For backward compatibility
  geometryParams: GeometryParameters
  showNetAnimation: boolean
  calculations: GeometryCalculations | null
}

// Legacy types for backward compatibility
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

export interface GameState {
  userStats: UserStats | null
  badges: Badge[]
  achievements: Achievement[]
  currentStreak: number
  dailyGoals: DailyGoal[]
  leaderboard: LeaderboardEntry[]
}

export interface DailyGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward_xp: number
  completed: boolean
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  total_xp: number
  level: number
  modules_completed: number
}

// 3D and Three.js related types
export interface Scene3DProps {
  geometry: GeometryType
  parameters: GeometryParameters
  showNet: boolean
  onParameterChange?: (params: Partial<GeometryParameters>) => void
}

export interface NetAnimationProps {
  geometry: GeometryType
  parameters: GeometryParameters
  playing: boolean
  onComplete?: () => void
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  full_name: string
  confirmPassword: string
}

export interface ProfileUpdateForm {
  full_name: string
  username: string
  avatar_url?: string
}

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'text' | 'outlined' | 'contained'
}

// New database types
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

export interface Assignment {
  id: string
  classroom_id: string
  teacher_id: string
  title: string
  description: string | null
  module_id: string | null
  lesson_id: string | null
  assignment_type: 'quiz' | 'lkpd' | 'project'
  due_date: string | null
  max_score: number
  rubric: any | null
  is_published: boolean
  created_at: string
  updated_at: string
}

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

// Constants
export const GEOMETRY_TYPES = {
  CYLINDER: 'cylinder' as const,
  CONE: 'cone' as const,
  SPHERE: 'sphere' as const
} as const

export const LESSON_TYPES = {
  INTRODUCTION: 'introduction',
  CONCEPT: 'concept',
  NET_ANIMATION: 'net-animation',
  FORMULA_DISCOVERY: 'formula-discovery',
  PROBLEM_SOLVING: 'problem-solving',
  PROJECT: 'project'
} as const

export const XP_VALUES = {
  LESSON_COMPLETE: 100,
  PERFECT_SCORE: 50,
  DAILY_LOGIN: 25,
  STREAK_BONUS: 10,
  BADGE_EARNED: 200
} as const

// ========================================
// LKPD Types (re-exported from lkpd.ts)
// ========================================
export type {
  // Section Types
  BaseSection,
  IntroSection,
  ActivitySection,
  ObservationSection,
  AnalysisSection,
  AnalysisQuestion,
  ConclusionSection,
  LKPDSection,

  // Worksheet Types
  MaterialsNeeded,
  LKPDRubric,
  LKPDWorksheet,

  // Submission Response Types
  ActivityResponse,
  ObservationResponse,
  AnalysisResponse,
  ConclusionResponse,
  SectionResponse,
  SectionResponses,

  // Submission Types
  LKPDStatus,
  AIFeedback,
  LKPDSubmission,

  // Helper Types
  LKPDProgress,
  CapturedParameters
} from './lkpd'

export {
  // Type Guards
  isActivitySection,
  isObservationSection,
  isAnalysisSection,
  isConclusionSection,
  isLKPDAssignment
} from './lkpd'