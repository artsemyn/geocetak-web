// src/stores/learningStore.ts
import { create } from 'zustand'
import {
  supabase,
  Module,
  Lesson,
  Student,
  StudentProgress,
  LessonCompletion, 
  Achievement,
  StudentAchievement,
  UserStats
} from '../services/supabase'

interface GeometryParams {
  radius: number
  height: number
  slantHeight?: number
}

// Tab tracking interface
interface ModuleTabProgress {
  moduleId: string
  visitedTabs: number[] // Array of tab indices that have been visited
  lastVisitedAt: string
}

interface LearningState {
  modules: Module[]
  currentModule: Module | null
  lessons: Lesson[]
  currentLesson: Lesson | null
  progress: StudentProgress[]
  achievements: Achievement[]
  currentStudent: Student | null
  userStats: UserStats | null
  loading: boolean

  // 3D Interaction State
  geometryParams: GeometryParams
  showNetAnimation: boolean

  // Tab tracking state
  moduleTabProgress: ModuleTabProgress[]

  // Actions
  fetchModules: () => Promise<void>
  setCurrentModule: (moduleId: string) => Promise<void>
  fetchLessons: (moduleId: string) => Promise<void>
  setCurrentLesson: (lessonId: string) => void
  updateGeometryParams: (params: Partial<GeometryParams>) => void
  toggleNetAnimation: () => void
  completeLesson: (lessonId: string, score?: number) => Promise<void>
  fetchUserStats: () => Promise<void>
  fetchStudentProfile: () => Promise<void>
  fetchAchievements: () => Promise<void>
  fetchProgress: (userId: string) => Promise<void>
  updateStreak: () => Promise<void>
  checkAndAwardBadges: () => Promise<void>
  fetchRecentActivity: () => Promise<void>
  resetStore: () => void

  // Tab tracking actions
  trackTabVisit: (moduleId: string, tabIndex: number) => Promise<void>
  getModuleTabProgress: (moduleId: string) => ModuleTabProgress | undefined
  getModuleProgressPercentage: (moduleId: string) => number
  loadTabProgressFromDatabase: () => Promise<void>
}

export const useLearningStore = create<LearningState>((set, get) => ({
  modules: [],
  currentModule: null,
  lessons: [],
  currentLesson: null,
  progress: [],
  achievements: [],
  currentStudent: null,
  userStats: null,
  loading: false,

  geometryParams: {
    radius: 5,
    height: 10
  },
  showNetAnimation: false,

  // Tab tracking state - load from localStorage initially
  moduleTabProgress: JSON.parse(localStorage.getItem('moduleTabProgress') || '[]'),

  // Load tab progress from database
  loadTabProgressFromDatabase: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch student progress from database
      const { data, error } = await supabase
        .from('student_progress')
        .select('module_id, completion_percentage, last_accessed_at')
        .eq('user_id', user.id)
        .not('module_id', 'is', null)

      if (error) {
        console.error('Error loading tab progress from database:', error)
        return
      }

      if (data && data.length > 0) {
        // Convert database data to ModuleTabProgress format
        const dbProgress: ModuleTabProgress[] = data.map(item => {
          const percentage = item.completion_percentage || 0
          const tabCount = Math.round((percentage / 100) * 5) // Reverse calculate tab count
          const visitedTabs = Array.from({ length: tabCount }, (_, i) => i) // [0, 1, 2, ...]

          return {
            moduleId: item.module_id!,
            visitedTabs,
            lastVisitedAt: item.last_accessed_at || new Date().toISOString()
          }
        })

        // Merge with localStorage data (keep whichever is more recent)
        const localProgress = get().moduleTabProgress
        const mergedProgress: ModuleTabProgress[] = []

        // Add all DB progress
        dbProgress.forEach(dbItem => {
          const localItem = localProgress.find(l => l.moduleId === dbItem.moduleId)

          if (localItem) {
            // If local has more tabs visited, use local; otherwise use DB
            const useLocal = localItem.visitedTabs.length > dbItem.visitedTabs.length
            mergedProgress.push(useLocal ? localItem : dbItem)
          } else {
            mergedProgress.push(dbItem)
          }
        })

        // Add local progress that's not in DB
        localProgress.forEach(localItem => {
          if (!dbProgress.find(db => db.moduleId === localItem.moduleId)) {
            mergedProgress.push(localItem)
          }
        })

        set({ moduleTabProgress: mergedProgress })
        localStorage.setItem('moduleTabProgress', JSON.stringify(mergedProgress))
        localStorage.setItem('moduleTabProgress', JSON.stringify(mergedProgress))
      }
    } catch (error) {
      console.error('Error loading tab progress:', error)
    }
  },

  // Tab tracking functions
  trackTabVisit: async (moduleId: string, tabIndex: number) => {
    const currentProgress = get().moduleTabProgress
    const existingModule = currentProgress.find(m => m.moduleId === moduleId)

    // Check if this is a new tab visit (for XP calculation)
    const isNewTabVisit = existingModule ? !existingModule.visitedTabs.includes(tabIndex) : true

    let updatedProgress: ModuleTabProgress[]

    if (existingModule) {
      // Add tab to visited tabs if not already visited
      const visitedTabs = existingModule.visitedTabs.includes(tabIndex)
        ? existingModule.visitedTabs
        : [...existingModule.visitedTabs, tabIndex].sort((a, b) => a - b)

      updatedProgress = currentProgress.map(m =>
        m.moduleId === moduleId
          ? { ...m, visitedTabs, lastVisitedAt: new Date().toISOString() }
          : m
      )
    } else {
      // Create new module progress entry
      updatedProgress = [
        ...currentProgress,
        {
          moduleId,
          visitedTabs: [tabIndex],
          lastVisitedAt: new Date().toISOString()
        }
      ]
    }

    // Save to state and localStorage
    set({ moduleTabProgress: updatedProgress })
    localStorage.setItem('moduleTabProgress', JSON.stringify(updatedProgress))

    // Sync to database and update gamification
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const moduleProgressData = updatedProgress.find(m => m.moduleId === moduleId)
      if (!moduleProgressData) return

      const completionPercentage = Math.round((moduleProgressData.visitedTabs.length / 5) * 100)
      const isModuleCompleted = completionPercentage === 100

      // Upsert to student_progress table
      const { error: progressError } = await supabase
        .from('student_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          lesson_id: moduleId,
          status: isModuleCompleted ? 'completed' : 'in_progress',
          completion_percentage: completionPercentage,
          last_accessed_at: new Date().toISOString(),
          completed_at: isModuleCompleted ? new Date().toISOString() : null
        })

      if (progressError) {
        console.error('Error syncing tab progress to database:', progressError)
        return
      }



      // ========================================
      // GAMIFICATION UPDATE - Award XP & Update Level
      // ========================================
      if (isNewTabVisit) {
        // Get current gamification data
        const { data: gamification, error: gamificationError } = await supabase
          .from('gamification')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (gamificationError || !gamification) {
          console.error('Error fetching gamification:', gamificationError)
          return
        }

        // Calculate XP earned
        let xpEarned = 10 // 10 XP per tab visited
        if (isModuleCompleted) {
          xpEarned += 50 // Bonus 50 XP for completing entire module
        }

        // Calculate new XP and level
        const newTotalXp = (gamification.total_xp || 0) + xpEarned
        const newLevel = Math.floor(newTotalXp / 500) + 1

        // Update gamification table
        const { error: updateError } = await supabase
          .from('gamification')
          .update({
            total_xp: newTotalXp,
            level: newLevel
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating gamification:', updateError)
        } else {
          // Gamification updated successfully
        }

        // Update streak (check if user has been active today)
        await get().updateStreak()

        // Check and award badges
        await get().checkAndAwardBadges()

        // Refresh user stats to update UI
        await get().fetchUserStats()
      }

    } catch (error) {
      console.error('Error syncing to database:', error)
    }
  },

  getModuleTabProgress: (moduleId: string) => {
    return get().moduleTabProgress.find(m => m.moduleId === moduleId)
  },

  getModuleProgressPercentage: (moduleId: string) => {
    const moduleProgress = get().moduleTabProgress.find(m => m.moduleId === moduleId)
    if (!moduleProgress) return 0

    // Total 5 tabs: Konsep, Implementasi, Jaring-jaring, Rumus, Quiz
    const totalTabs = 5
    const visitedCount = moduleProgress.visitedTabs.length

    return Math.round((visitedCount / totalTabs) * 100)
  },

  fetchModules: async () => {
    try {
      set({ loading: true })

      console.log('[LearningStore] Fetching modules from Supabase...')
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index')

      const fallbackModules = [
        {
          id: '4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd',
          name: 'Tabung',
          title: 'Tabung',
          slug: 'tabung',
          description: 'Modul ini membahas bentuk geometri tabung secara visual 3D, dilengkapi animasi interaktif, rumus volume dan luas permukaan, serta latihan soal berbasis masalah nyata',
          icon_url: null,
          order_index: 1,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '30e22668-7150-4e07-8c43-a4e9468c3e2f',
          name: 'Kerucut',
          title: 'Kerucut',
          slug: 'kerucut',
          description: 'Modul ini menyajikan konsep kerucut dengan animasi interaktif, penjelasan garis pelukis, perhitungan volume, serta penerapan pada kehidupan sehari-hari',
          icon_url: null,
          order_index: 2,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'a5e50615-afaf-492b-ba89-7a1b09e4b03a',
          name: 'Bola',
          title: 'Bola',
          slug: 'bola',
          description: 'Modul ini mengajarkan konsep bola secara visual, meliputi simetri, jaring-jaring bola, perhitungan volume dan luas permukaan, serta penerapan dalam kehidupan sehari-hari',
          icon_url: null,
          order_index: 3,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      if (error) {
        console.error('Error fetching modules:', error)
        set({ modules: fallbackModules, loading: false })
      } else if (data && data.length > 0) {
        set({ modules: data, loading: false })
      } else {
        console.warn('No modules found in database, using fallback')
        set({ modules: fallbackModules, loading: false })
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      set({ loading: false })
    }
  },

  setCurrentModule: async (moduleId: string) => {
    const modules = get().modules
    const module = modules.find(m => m.id === moduleId)
    set({ currentModule: module || null })

    if (module) {
      await get().fetchLessons(moduleId)
    }
  },

  fetchLessons: async (moduleId: string) => {
    // Helper to get fallback lessons based on module ID
    const getFallbackLessons = (mid: string): Lesson[] => {
      // Defined mapped lessons for specific modules
      const lessonMap: Record<string, any[]> = {
        '4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd': [ // Tabung
          { id: '32e025a0-3b15-4a8f-a7a6-e990a5b8c784', title: 'Konsep Dasar', slug: 'konsep-dasar', lesson_type: 'concept', order_index: 1 },
          { id: 'd490346b-96a3-4b74-9473-61b5b38b0924', title: 'Rumus dan Perhitungan', slug: 'rumus-perhitungan', lesson_type: 'formula', order_index: 2 },
          { id: 'dcd96a9a-8735-4d1d-b0fa-906b0ec4c685', title: 'Jaring-jaring 3D', slug: 'jaring-jaring', lesson_type: 'interactive', order_index: 3 }
        ],
        '30e22668-7150-4e07-8c43-a4e9468c3e2f': [ // Kerucut
          { id: '1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f', title: 'Konsep Dasar', slug: 'konsep-dasar', lesson_type: 'concept', order_index: 1 },
          { id: 'f5e2f83e-b518-4859-b7c5-fede3c7d6d53', title: 'Rumus dan Perhitungan', slug: 'rumus-perhitungan', lesson_type: 'formula', order_index: 2 },
          { id: '76c278f6-23d7-4b73-8ef2-73943ccb4af9', title: 'Jaring-jaring 3D', slug: 'jaring-jaring', lesson_type: 'interactive', order_index: 3 }
        ],
        'a5e50615-afaf-492b-ba89-7a1b09e4b03a': [ // Bola
          { id: '3a12fd4d-4e6e-4974-90e1-1a44ea37649e', title: 'Konsep Dasar', slug: 'konsep-dasar', lesson_type: 'concept', order_index: 1 },
          { id: 'ec43f654-5eaf-4494-abc7-6b47d0158994', title: 'Rumus dan Perhitungan', slug: 'rumus-perhitungan', lesson_type: 'formula', order_index: 2 },
          { id: '92f9be24-eb1b-4e9a-a4db-9f1d77d83dbe', title: 'Jaring-jaring 3D', slug: 'jaring-jaring', lesson_type: 'interactive', order_index: 3 }
        ]
      }

      if (lessonMap[mid]) {
        return lessonMap[mid].map(l => ({
          id: l.id,
          module_id: mid,
          title: l.title,
          slug: l.slug,
          order_index: l.order_index,
          lesson_type: l.lesson_type,
          content_markdown: null,
          video_url: null,
          scene_config: null,
          xp_reward: 50,
          estimated_duration_minutes: 20,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      }

      // Generic Fallback
      return [
        {
          id: '1',
          module_id: mid,
          title: 'Konsep Dasar',
          slug: 'konsep-dasar',
          order_index: 1,
          lesson_type: 'concept',
          content_markdown: null,
          video_url: null,
          scene_config: null,
          xp_reward: 50,
          estimated_duration_minutes: 15,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          module_id: mid,
          title: 'Rumus dan Perhitungan',
          slug: 'rumus-perhitungan',
          order_index: 2,
          lesson_type: 'formula',
          content_markdown: null,
          video_url: null,
          scene_config: null,
          xp_reward: 50,
          estimated_duration_minutes: 20,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          module_id: mid,
          title: 'Jaring-jaring 3D',
          slug: 'jaring-jaring',
          order_index: 3,
          lesson_type: 'interactive',
          content_markdown: null,
          video_url: null,
          scene_config: null,
          xp_reward: 50,
          estimated_duration_minutes: 25,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          module_id: mid,
          title: 'Quiz Evaluasi',
          slug: 'quiz-evaluasi',
          order_index: 4,
          lesson_type: 'quiz',
          content_markdown: null,
          video_url: null,
          scene_config: null,
          xp_reward: 100,
          estimated_duration_minutes: 15,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order_index')

      if (error) {
        console.warn('Database error, using fallback lessons:', error.message)
        set({ lessons: getFallbackLessons(moduleId) })
      } else if (data && data.length > 0) {
        set({ lessons: data })
      } else {
        console.warn('No lessons found in database, using fallback')
        set({ lessons: getFallbackLessons(moduleId) })
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      set({ lessons: getFallbackLessons(moduleId) })
    }
  },

  setCurrentLesson: (lessonId: string) => {
    const lessons = get().lessons
    const lesson = lessons.find(l => l.id === lessonId)
    set({ currentLesson: lesson || null })
  },

  updateGeometryParams: (params: Partial<GeometryParams>) => {
    set({
      geometryParams: {
        ...get().geometryParams,
        ...params
      }
    })
  },

  toggleNetAnimation: () => {
    set({ showNetAnimation: !get().showNetAnimation })
  },

  completeLesson: async (lessonId: string, score = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return
      }

      const lesson = get().lessons.find(l => l.id === lessonId)
      const xpEarned = lesson?.xp_reward || (score >= 80 ? 100 : score >= 60 ? 75 : 50)

      // Record lesson completion in student_progress
      const { error: progressError } = await supabase
        .from('student_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          module_id: lesson?.module_id || null,
          status: 'completed',
          score,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })

      if (progressError) {
        console.error('Error recording lesson completion:', progressError)
        return
      }

      // Get current gamification data
      const { data: gamification, error: gamificationError } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (gamificationError || !gamification) {
        console.error('Error fetching gamification:', gamificationError)
        return
      }

      // Calculate new XP and level
      const newTotalXp = (gamification.total_xp || 0) + xpEarned
      const newLevel = Math.floor(newTotalXp / 500) + 1

      // Update gamification table with new XP and level
      const { error: updateError } = await supabase
        .from('gamification')
        .update({
          total_xp: newTotalXp,
          level: newLevel
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating gamification:', updateError)
        return
      }

      // Update local progress state
      const currentProgress = get().progress
      const existingProgressIndex = currentProgress.findIndex(
        p => p.lesson_id === lessonId && p.user_id === user.id
      )

      const updatedProgressItem = {
        id: existingProgressIndex >= 0 ? currentProgress[existingProgressIndex].id : crypto.randomUUID(),
        user_id: user.id,
        lesson_id: lessonId,
        module_id: lesson?.module_id || null,
        status: 'completed' as const,
        score,
        completed_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
        lesson_title: lesson?.title || null,
        xp_earned: xpEarned
      }

      if (existingProgressIndex >= 0) {
        const newProgress = [...currentProgress]
        newProgress[existingProgressIndex] = updatedProgressItem
        set({ progress: newProgress })
      } else {
        set({ progress: [...currentProgress, updatedProgressItem] })
      }

      // Update streak (will check if needs update for today)
      await get().updateStreak()

      // Check and award badges
      await get().checkAndAwardBadges()

      // Refresh user stats to get latest data
      await get().fetchUserStats()
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  },

  fetchUserStats: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user found')
        return
      }

      // Fetch from gamification table
      const { data: gamificationData, error } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !gamificationData) {
        // Create initial gamification record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('gamification')
          .insert({
            user_id: user.id,
            total_xp: 0,
            level: 1,
            current_streak_days: 0,
            longest_streak_days: 0,
            last_activity_date: new Date().toISOString().split('T')[0],
            badges_earned: []
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating gamification record:', insertError)
          set({
            userStats: {
              id: user.id,
              total_xp: 0,
              level: 1,
              badges: [],
              streak_days: 0,
              last_activity: new Date().toISOString().split('T')[0]
            }
          })
          return
        }

        set({
          userStats: {
            id: newData.user_id,
            total_xp: newData.total_xp,
            level: newData.level,
            badges: newData.badges_earned || [],
            streak_days: newData.current_streak_days,
            last_activity: newData.last_activity_date
          }
        })
      } else {
        // Use existing gamification data
        set({
          userStats: {
            id: gamificationData.user_id,
            total_xp: gamificationData.total_xp,
            level: gamificationData.level,
            badges: gamificationData.badges_earned || [],
            streak_days: gamificationData.current_streak_days,
            last_activity: gamificationData.last_activity_date
          }
        })
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      set({ userStats: null })
    }
  },

  fetchStudentProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Create a mock student profile based on the current user
      const mockStudent = {
        id: 1,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        email: user.email,
        nis: null,
        class_id: null,
        teacher_id: 1,
        xp_points: 0,
        total_badges: 0,
        streak_days: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Using mock student profile for:', user.email)
      set({ currentStudent: mockStudent })
    } catch (error) {
      console.error('Error creating student profile:', error)
      set({ currentStudent: null })
    }
  },

  fetchAchievements: async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at')

      if (error) {
        console.error('Error fetching achievements:', error)
        set({ achievements: [] })
      } else {
        set({ achievements: data || [] })
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
      set({ achievements: [] })
    }
  },

  fetchProgress: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          lesson:lessons(
            title,
            xp_reward
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')

      if (error) {
        console.error('Error fetching progress:', error)
        set({ progress: [] })
      } else {
        // Map the data to include lesson title and xp_earned
        const progressWithDetails = (data || []).map(p => ({
          ...p,
          lesson_title: p.lesson?.title || null,
          xp_earned: p.lesson?.xp_reward || 0
        }))
        set({ progress: progressWithDetails })
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      set({ progress: [] })
    }
  },

  updateStreak: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: gamification, error: fetchError } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError || !gamification) {
        console.error('Error fetching gamification for streak update:', fetchError)
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const lastActivity = gamification.last_activity_date

      let newStreak = gamification.current_streak_days

      // Check if already updated today
      if (lastActivity === today) {
        console.log('Streak already updated today')
        return
      }

      // Calculate new streak
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!

      if (lastActivity === yesterday) {
        // Continue streak
        newStreak = gamification.current_streak_days + 1
        console.log('Continuing streak:', newStreak)
      } else if (!lastActivity || lastActivity < yesterday) {
        // Reset streak
        newStreak = 1
        console.log('Resetting streak to 1')
      }

      // Update database
      const { error: updateError } = await supabase
        .from('gamification')
        .update({
          current_streak_days: newStreak,
          longest_streak_days: Math.max(newStreak, gamification.longest_streak_days || 0),
          last_activity_date: today
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating streak:', updateError)
        return
      }

      // Refresh user stats
      await get().fetchUserStats()
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  },

  checkAndAwardBadges: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userStats = get().userStats
      const progress = get().progress
      if (!userStats) return

      // Fetch all available badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')

      if (badgesError || !allBadges) {
        console.log('No badges available or error fetching badges:', badgesError)
        return
      }

      const earnedBadgeIds = userStats.badges.map((b: any) => b.id || b)
      const newBadges = []

      for (const badge of allBadges) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badge.id)) continue

        let shouldAward = false

        // Check requirements based on type
        if (badge.requirement_type === 'xp' && userStats.total_xp >= badge.requirement_value) {
          shouldAward = true
        } else if (badge.requirement_type === 'streak' && userStats.streak_days >= badge.requirement_value) {
          shouldAward = true
        } else if (badge.requirement_type === 'lessons' && progress.length >= badge.requirement_value) {
          shouldAward = true
        } else if (badge.requirement_type === 'modules') {
          // Count unique modules completed
          const uniqueModules = new Set(progress.map((p: any) => p.module_id)).size
          if (uniqueModules >= badge.requirement_value) {
            shouldAward = true
          }
        }

        if (shouldAward) {
          newBadges.push(badge)
          console.log('Awarding badge:', badge.name)
        }
      }

      // Update gamification table with new badges
      if (newBadges.length > 0) {
        const updatedBadges = [...userStats.badges, ...newBadges]

        const { error: updateError } = await supabase
          .from('gamification')
          .update({ badges_earned: updatedBadges })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating badges:', updateError)
          return
        }

        // Refresh user stats
        await get().fetchUserStats()
      }
    } catch (error) {
      console.error('Error checking and awarding badges:', error)
    }
  },

  fetchRecentActivity: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          lesson:lessons(
            title,
            xp_reward
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching recent activity:', error)
      } else {
        // Map the data to include lesson details
        const progressWithDetails = (data || []).map(p => ({
          ...p,
          lesson_title: p.lesson?.title || null,
          xp_earned: p.lesson?.xp_reward || 0
        }))
        set({ progress: progressWithDetails })
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    }
  },

  resetStore: () => {
    set({
      modules: [],
      currentModule: null,
      lessons: [],
      currentLesson: null,
      progress: [],
      achievements: [],
      currentStudent: null,
      userStats: null,
      loading: false,
      geometryParams: {
        radius: 5,
        height: 10
      },
      showNetAnimation: false,
      moduleTabProgress: []
    })
    localStorage.removeItem('moduleTabProgress')
  }
}))