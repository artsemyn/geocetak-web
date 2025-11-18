// src/stores/authStore.ts
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase, Profile, Student, Teacher } from '../services/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  student: Student | null
  teacher: Teacher | null
  userType: 'student' | 'teacher' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, schoolName: string, gradeLevel: string, classCode?: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  fetchUserData: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  student: null,
  teacher: null,
  userType: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    set({ user: data.user })
    await get().fetchUserData()
  },

  signUp: async (email: string, password: string, fullName: string, schoolName: string, gradeLevel: string, classCode?: string) => {
    // Step 1: Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          school_name: schoolName,
          grade_level: gradeLevel
        }
      }
    })

    if (error) throw error

    // Step 2: Create profile in public.profiles
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          school_name: schoolName,
          grade_level: gradeLevel,
          role: 'student'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw new Error('Failed to create profile: ' + profileError.message)
      }

      // Step 3: Create gamification record
      const { error: gamificationError } = await supabase
        .from('gamification')
        .insert({
          user_id: data.user.id,
          total_xp: 0,
          level: 1,
          current_streak_days: 0,
          longest_streak_days: 0
        })

      if (gamificationError) {
        console.error('Error creating gamification record:', gamificationError)
      }

      // Step 4: Join classroom if class code is provided
      if (classCode && classCode.trim() !== '') {
        // Find classroom by class code
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .select('id')
          .eq('class_code', classCode.trim().toUpperCase())
          .single()

        if (classroomError || !classroom) {
          console.error('Invalid class code:', classCode)
          throw new Error('Kode kelas tidak valid. Silakan periksa kembali kode kelas Anda.')
        }

        // Add student to classroom_members
        const { error: memberError } = await supabase
          .from('classroom_members')
          .insert({
            classroom_id: classroom.id,
            student_id: data.user.id,
            joined_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (memberError) {
          console.error('Error joining classroom:', memberError)
          throw new Error('Gagal bergabung ke kelas: ' + memberError.message)
        }

        console.log('Successfully joined classroom:', classroom.id)
      }
    }

    set({ user: data.user, userType: 'student' })
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut()
      set({
        user: null,
        profile: null,
        student: null,
        teacher: null,
        userType: null,
        loading: false
      })
    } catch (error) {
      console.error('Error during sign out:', error)
      // Still clear the user state even if signOut fails
      set({
        user: null,
        profile: null,
        student: null,
        teacher: null,
        userType: null,
        loading: false
      })
    }
  },

  fetchProfile: async () => {
    const user = get().user
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    set({ profile: data })
  },

  fetchUserData: async () => {
    const user = get().user
    if (!user?.email) return

    try {
      // Create a mock student profile based on the authenticated user
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

      console.log('Creating mock student profile for:', user.email)
      set({
        student: mockStudent,
        teacher: null,
        userType: 'student'
      })
    } catch (error) {
      console.error('Error creating user data:', error)
      set({
        student: null,
        teacher: null,
        userType: null
      })
    }
  }
}))

// Initialize auth state
const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    useAuthStore.setState({
      user: session?.user ?? null,
      loading: false
    })

    if (session?.user) {
      await useAuthStore.getState().fetchUserData()
    }
  } catch (error) {
    console.error('Error initializing auth:', error)
    useAuthStore.setState({ loading: false })
  }
}

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  useAuthStore.setState({
    user: session?.user ?? null,
    loading: false
  })

  if (session?.user) {
    await useAuthStore.getState().fetchUserData()
  } else {
    useAuthStore.setState({
      student: null,
      teacher: null,
      userType: null,
      profile: null
    })
  }
})

// Initialize auth immediately
initializeAuth()