// src/App.tsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline, CircularProgress } from '@mui/material'
import { useAuthStore } from './stores/authStore'
import { useLearningStore } from './stores/learningStore'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import LearningModule from './pages/LearningModule'
import Credits from './pages/Credits'
import Login from './pages/Login'
import ThreeEditor from './pages/ThreeEditor'
import MyModels from './pages/MyModels'
import PracticeQuestions from './pages/PracticeQuestions'
import ChatBotPage from './pages/ChatBotPage'
import Profile from './pages/Profile'
import { LKPDWorkspace } from './components/lkpd/LKPDWorkspace'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2'
    },
    secondary: {
      main: '#F39C12'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
  }
})

// AssignmentRouter component - routes based on assignment type
const AssignmentRouter: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) {
        setError('Assignment ID not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('assignments')
          .select('*')
          .eq('id', assignmentId)
          .single()

        if (fetchError) throw fetchError
        if (!data) throw new Error('Assignment not found')

        setAssignment(data as Assignment)
      } catch (err: any) {
        console.error('Error fetching assignment:', err)
        setError(err.message || 'Failed to load assignment')
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [assignmentId])

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </div>
    )
  }

  // Error state
  if (error || !assignment) {
    return <Navigate to="/assessment" replace />
  }

  // Route based on assignment type
  if (assignment.assignment_type === 'lkpd') {
    return <LKPDWorkspace />
  }

  // Default fallback (now also uses LKPDWorkspace since Assessment is replaced)
  return <LKPDWorkspace />
}

function App() {
  // Add Vercel Analytics component 
  <>
    // Add Vercel Analytics component 
    <Analytics /><SpeedInsights /></>
  const { user, student, loading } = useAuthStore()
  const { fetchModules, fetchStudentProfile, fetchUserStats } = useLearningStore()

  useEffect(() => {
    if (user) {
      fetchModules()
      fetchStudentProfile()
    }
  }, [user])

  useEffect(() => {
    if (student) {
      fetchUserStats()
    }
  }, [student])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {/* All pages are now standalone with their own Navbar */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/module/:moduleSlug" element={<LearningModule />} />
              <Route path="/assessment" element={<LKPDWorkspace />} />
              <Route path="/assignment/:assignmentId" element={<AssignmentRouter />} />
              <Route path="/three-editor" element={<ThreeEditor />} />
              <Route path="/my-models" element={<MyModels />} />
              <Route path="/chatbot" element={<ChatBotPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/credits" element={<Credits />} />
              {/* <Route path="/practice/:moduleId" element={<PracticeQuestions />} /> */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App