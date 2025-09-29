// src/types/index.ts

// Database Types (matching Supabase schema)
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Module {
  id: number
  name: string
  slug: string
  description: string | null
  order_index: number | null
  created_at: string
}

export interface Lesson {
  id: number
  module_id: number
  title: string
  slug: string
  content: LessonContent | null
  order_index: number | null
  created_at: string
}

export interface StudentProgress {
  id: number
  user_id: string
  lesson_id: number
  completed_at: string
  score: number | null
  xp_earned: number
}

export interface UserStats {
  id: string
  total_xp: number
  level: number
  badges: Badge[]
  streak_days: number
  last_activity: string
  updated_at: string
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
  type: 'multiple-choice' | 'true-false' | 'fill-in' | 'essay'
  question: string
  options?: string[]
  correct_answer: string | string[]
  explanation: string
  points: number
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
export type GeometryType = 'cylinder' | 'cone' | 'sphere'

export interface GeometryParameters {
  radius: number
  height: number
  slantHeight?: number // for cone
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
  name: string
  description: string
  icon: string
  earned_at?: string
  category: 'learning' | 'achievement' | 'streak' | 'social'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  condition: AchievementCondition
  reward: AchievementReward
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
  loading: boolean
}

export interface LearningState {
  modules: Module[]
  currentModule: Module | null
  lessons: Lesson[]
  currentLesson: Lesson | null
  progress: StudentProgress[]
  userStats: UserStats | null
  geometryParams: GeometryParameters
  showNetAnimation: boolean
  calculations: GeometryCalculations | null
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