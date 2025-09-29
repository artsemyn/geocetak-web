// src/services/api.ts
import { supabase } from './supabase'
import { 
  Module, 
  Lesson, 
  StudentProgress, 
  UserStats, 
  Profile,
  GeometryType,
  GeometryParameters 
} from '../types'

// ===== AUTHENTICATION =====

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ===== PROFILES =====

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export async function createProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ===== MODULES & LESSONS =====

export async function getAllModules(): Promise<Module[]> {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .order('order_index')
  
  if (error) throw error
  return data || []
}

export async function getModuleBySlug(slug: string): Promise<Module | null> {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getLessonsByModule(moduleId: number): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index')
  
  if (error) throw error
  return data || []
}

export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ===== STUDENT PROGRESS =====

export async function getStudentProgress(userId: string): Promise<StudentProgress[]> {
  const { data, error } = await supabase
    .from('student_progress')
    .select(`
      *,
      lessons:lesson_id (
        title,
        module_id,
        modules:module_id (
          name,
          slug
        )
      )
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getModuleProgress(userId: string, moduleId: number) {
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('module_id', moduleId)
  
  const { data: progress } = await supabase
    .from('student_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessons?.map(l => l.id) || [])
  
  const totalLessons = lessons?.length || 0
  const completedLessons = progress?.length || 0
  
  return {
    total: totalLessons,
    completed: completedLessons,
    percentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  }
}

export async function completeLesson(
  userId: string, 
  lessonId: number, 
  score: number = 0,
  timeSpent?: number
): Promise<StudentProgress> {
  // Calculate XP based on score
  let xpEarned = 50 // Base XP
  if (score >= 100) xpEarned = 150 // Perfect score
  else if (score >= 80) xpEarned = 100 // Good score
  else if (score >= 60) xpEarned = 75 // Passing score

  const { data, error } = await supabase
    .from('student_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      score,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error

  // Update user stats
  await updateUserStats(userId, xpEarned)
  
  return data
}

// ===== USER STATS & GAMIFICATION =====

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function initializeUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from('user_stats')
    .insert({
      id: userId,
      total_xp: 0,
      level: 1,
      badges: [],
      streak_days: 0,
      last_activity: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUserStats(userId: string, xpToAdd: number) {
  // Get current stats
  let currentStats = await getUserStats(userId)
  
  // Initialize if doesn't exist
  if (!currentStats) {
    currentStats = await initializeUserStats(userId)
  }
  
  const newTotalXp = currentStats.total_xp + xpToAdd
  const newLevel = Math.floor(newTotalXp / 500) + 1
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate streak
  let streakDays = currentStats.streak_days
  const lastActivity = new Date(currentStats.last_activity)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (currentStats.last_activity === today) {
    // Same day, no streak change
  } else if (currentStats.last_activity === yesterday.toISOString().split('T')[0]) {
    // Consecutive day
    streakDays += 1
  } else {
    // Streak broken
    streakDays = 1
  }

  const { data, error } = await supabase
    .from('user_stats')
    .update({
      total_xp: newTotalXp,
      level: newLevel,
      streak_days: streakDays,
      last_activity: today,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function addBadgeToUser(userId: string, badgeId: string) {
  const currentStats = await getUserStats(userId)
  if (!currentStats) return
  
  const badges = currentStats.badges || []
  if (!badges.includes(badgeId)) {
    badges.push(badgeId)
    
    const { data, error } = await supabase
      .from('user_stats')
      .update({
        badges,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
  
  return currentStats
}

// ===== 3D MODEL EXPORT =====

export async function requestModelExport(
  userId: string,
  geometryType: GeometryType,
  parameters: GeometryParameters,
  filename?: string
) {
  const { data, error } = await supabase
    .from('export_jobs')
    .insert({
      user_id: userId,
      geometry_type: geometryType,
      parameters: parameters,
      filename: filename || `${geometryType}_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getExportJob(jobId: string) {
  const { data, error } = await supabase
    .from('export_jobs')
    .select('*')
    .eq('id', jobId)
    .single()
  
  if (error) throw error
  return data
}

export async function getUserExportJobs(userId: string) {
  const { data, error } = await supabase
    .from('export_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data || []
}

// ===== LEADERBOARD =====

export async function getLeaderboard(limit: number = 20) {
  const { data, error } = await supabase
    .from('user_stats')
    .select(`
      id,
      total_xp,
      level,
      profiles:id (
        username,
        full_name,
        avatar_url
      )
    `)
    .order('total_xp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getUserRank(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_rank', { user_id: userId })
  
  if (error) throw error
  return data
}

// ===== ANALYTICS =====

export async function trackUserActivity(
  userId: string,
  activity: string,
  metadata?: Record<string, any>
) {
  const { error } = await supabase
    .from('user_activities')
    .insert({
      user_id: userId,
      activity,
      metadata,
      created_at: new Date().toISOString()
    })
  
  if (error) console.error('Failed to track activity:', error)
}

export async function getLearningAnalytics(userId: string, timeframe: 'week' | 'month' | 'all' = 'month') {
  let query = supabase
    .from('student_progress')
    .select('*')
    .eq('user_id', userId)
  
  if (timeframe !== 'all') {
    const days = timeframe === 'week' ? 7 : 30
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    query = query.gte('completed_at', cutoffDate.toISOString())
  }
  
  const { data, error } = await query.order('completed_at')
  
  if (error) throw error
  
  // Process analytics
  const totalLessons = data?.length || 0
  const totalXP = data?.reduce((sum, item) => sum + (item.xp_earned || 0), 0) || 0
  const averageScore = data?.reduce((sum, item) => sum + (item.score || 0), 0) / totalLessons || 0
  
  return {
    totalLessons,
    totalXP,
    averageScore,
    rawData: data || []
  }
}

// ===== ERROR HANDLING UTILITY =====

export function handleSupabaseError(error: any): string {
  console.error('Supabase error:', error)
  
  if (error.code === 'PGRST116') {
    return 'Data tidak ditemukan'
  }
  
  if (error.code === '23505') {
    return 'Data sudah ada'
  }
  
  if (error.message?.includes('authentication')) {
    return 'Silakan login terlebih dahulu'
  }
  
  return error.message || 'Terjadi kesalahan pada server'
}