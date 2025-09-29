// src/App.tsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { useAuthStore } from './stores/authStore'
import { useLearningStore } from './stores/learningStore'
import Dashboard from './pages/Dashboard'
import Modules from './pages/Modules'
import LearningModule from './pages/LearningModule'
import Credits from './pages/Credits'
import Login from './pages/Login'
import ThreeEditor from './pages/ThreeEditor'
import MyModels from './pages/MyModels'
import DashboardLayout from './components/layout/DashboardLayout'

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

function App() {
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
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="modules" element={<Modules />} />
              <Route path="module/:moduleSlug" element={<LearningModule />} />
              <Route path="three-editor" element={<ThreeEditor />} />
              <Route path="my-models" element={<MyModels />} />
              <Route path="credits" element={<Credits />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App