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
  signUp: (email: string, password: string, fullName: string, userType: 'student' | 'teacher') => Promise<void>
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

  signUp: async (email: string, password: string, fullName: string, userType: 'student' | 'teacher') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    })

    if (error) throw error
    set({ user: data.user, userType })
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