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
  resetStore: () => void
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

  fetchModules: async () => {
    set({ loading: true })

    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_published', true)
        .order('order_index')

      if (error) {
        console.warn('Database error, using fallback modules:', error.message)
        // Fallback to static data if database fails
        const fallbackModules = [
          {
            id: 'mod-1',
            title: 'Tabung',
            slug: 'tabung',
            description: 'Mempelajari bentuk geometri tabung dan rumus-rumusnya',
            icon_url: null,
            order_index: 1,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mod-2',
            title: 'Kerucut',
            slug: 'kerucut',
            description: 'Mempelajari bentuk geometri kerucut dan rumus-rumusnya',
            icon_url: null,
            order_index: 2,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mod-3',
            title: 'Bola',
            slug: 'bola',
            description: 'Mempelajari bentuk geometri bola dan rumus-rumusnya',
            icon_url: null,
            order_index: 3,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        set({ modules: fallbackModules, loading: false })
      } else if (data && data.length > 0) {
        console.log('✅ Modules loaded from database:', data.length, 'modules')
        set({ modules: data, loading: false })
      } else {
        console.warn('No modules found in database, using fallback')
        // Fallback if no data
        const fallbackModules = [
          {
            id: 'mod-1',
            title: 'Tabung',
            slug: 'tabung',
            description: 'Mempelajari bentuk geometri tabung dan rumus-rumusnya',
            icon_url: null,
            order_index: 1,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mod-2',
            title: 'Kerucut',
            slug: 'kerucut',
            description: 'Mempelajari bentuk geometri kerucut dan rumus-rumusnya',
            icon_url: null,
            order_index: 2,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mod-3',
            title: 'Bola',
            slug: 'bola',
            description: 'Mempelajari bentuk geometri bola dan rumus-rumusnya',
            icon_url: null,
            order_index: 3,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        set({ modules: fallbackModules, loading: false })
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
      // Fallback on any error
      const fallbackModules = [
        {
          id: 1,
          name: 'Tabung',
          slug: 'tabung',
          description: 'Mempelajari bentuk geometri tabung dan rumus-rumusnya',
          icon_url: null,
          order_index: 1,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Kerucut',
          slug: 'kerucut',
          description: 'Mempelajari bentuk geometri kerucut dan rumus-rumusnya',
          icon_url: null,
          order_index: 2,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Bola',
          slug: 'bola',
          description: 'Mempelajari bentuk geometri bola dan rumus-rumusnya',
          icon_url: null,
          order_index: 3,
          is_published: true,
          xp_reward: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      set({ modules: fallbackModules, loading: false })
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
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order_index')

      if (error) {
        console.warn('Database error, using fallback lessons:', error.message)
        // Fallback to static data
        const fallbackLessons = [
          {
            id: 1,
            module_id: moduleId,
            title: 'Konsep Dasar',
            slug: 'konsep-dasar',
            order_index: 1,
            lesson_type: 'concept',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 15,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            module_id: moduleId,
            title: 'Rumus dan Perhitungan',
            slug: 'rumus-perhitungan',
            order_index: 2,
            lesson_type: 'formula',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 20,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            module_id: moduleId,
            title: 'Jaring-jaring 3D',
            slug: 'jaring-jaring',
            order_index: 3,
            lesson_type: 'interactive',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 25,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        set({ lessons: fallbackLessons })
      } else if (data && data.length > 0) {
        console.log('✅ Lessons loaded from database:', data.length, 'lessons for module', moduleId)
        set({ lessons: data })
      } else {
        console.warn('No lessons found in database, using fallback')
        // Fallback if no data
        const fallbackLessons = [
          {
            id: 1,
            module_id: moduleId,
            title: 'Konsep Dasar',
            slug: 'konsep-dasar',
            order_index: 1,
            lesson_type: 'concept',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 15,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            module_id: moduleId,
            title: 'Rumus dan Perhitungan',
            slug: 'rumus-perhitungan',
            order_index: 2,
            lesson_type: 'formula',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 20,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            module_id: moduleId,
            title: 'Jaring-jaring 3D',
            slug: 'jaring-jaring',
            order_index: 3,
            lesson_type: 'interactive',
            content_data: null,
            interactive_config: null,
            xp_reward: 50,
            estimated_duration: 25,
            is_published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        set({ lessons: fallbackLessons })
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      // Fallback on any error
      const fallbackLessons = [
        {
          id: 1,
          module_id: moduleId,
          title: 'Konsep Dasar',
          slug: 'konsep-dasar',
          order_index: 1,
          lesson_type: 'concept',
          content_data: null,
          interactive_config: null,
          xp_reward: 50,
          estimated_duration: 15,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          module_id: moduleId,
          title: 'Rumus dan Perhitungan',
          slug: 'rumus-perhitungan',
          order_index: 2,
          lesson_type: 'formula',
          content_data: null,
          interactive_config: null,
          xp_reward: 50,
          estimated_duration: 20,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          module_id: moduleId,
          title: 'Jaring-jaring 3D',
          slug: 'jaring-jaring',
          order_index: 3,
          lesson_type: 'interactive',
          content_data: null,
          interactive_config: null,
          xp_reward: 50,
          estimated_duration: 25,
          is_published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      set({ lessons: fallbackLessons })
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

  completeLesson: async (lessonId: number, score = 0) => {
    const currentStudent = get().currentStudent
    if (!currentStudent) return

    const lesson = get().lessons.find(l => l.id === lessonId)
    const xpEarned = lesson?.xp_reward || (score >= 80 ? 100 : score >= 60 ? 75 : 50)

    try {
      // Record lesson completion
      await supabase
        .from('lesson_completions')
        .upsert({
          student_id: currentStudent.id,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          score,
          xp_earned: xpEarned,
          time_spent: 0 // You can track this separately
        })

      // Update student XP
      const newXp = (currentStudent.xp_points || 0) + xpEarned
      await supabase
        .from('students')
        .update({
          xp_points: newXp,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', currentStudent.id)

      // Update module progress
      const moduleId = lesson?.module_id
      if (moduleId) {
        const { data: progress } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', currentStudent.id)
          .eq('module_id', moduleId)
          .single()

        const newXpEarned = (progress?.total_xp_earned || 0) + xpEarned

        await supabase
          .from('student_progress')
          .upsert({
            student_id: currentStudent.id,
            module_id: moduleId,
            current_lesson_id: lessonId,
            total_xp_earned: newXpEarned,
            last_accessed_at: new Date().toISOString()
          })
      }

      await get().fetchUserStats()
      await get().fetchStudentProfile()
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  },

  fetchUserStats: async () => {
    try {
      const currentStudent = get().currentStudent
      if (!currentStudent) return

      const level = Math.floor((currentStudent.xp_points || 0) / 500) + 1

      // Create mock user stats
      const mockUserStats = {
        id: currentStudent.id,
        total_xp: currentStudent.xp_points || 0,
        level,
        badges: [], // Empty badges for now
        streak_days: currentStudent.streak_days || 0,
        last_activity: currentStudent.last_activity_date || new Date().toISOString().split('T')[0]
      }

      console.log('Using mock user stats')
      set({ userStats: mockUserStats })
    } catch (error) {
      console.error('Error creating user stats:', error)
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

  fetchProgress: async (studentId: number) => {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)

      if (error) {
        console.error('Error fetching progress:', error)
        set({ progress: [] })
      } else {
        set({ progress: data || [] })
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      set({ progress: [] })
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
      showNetAnimation: false
    })
  }
}))