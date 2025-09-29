// src/pages/Login.tsx
import React, { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material'
import { School, Calculate } from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuthStore()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await signUp(email, password, fullName)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        {/* Logo & Brand */}
        <Box display="flex" alignItems="center" mb={4}>
          <Calculate sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
            GeoCetak
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" color="textSecondary" mb={4} textAlign="center">
          Platform Pembelajaran Geometri 3D Interaktif
        </Typography>

        <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} centered>
              <Tab label="Masuk" />
              <Tab label="Daftar" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSignIn}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Masuk'}
              </Button>
            </form>
          </TabPanel>

          {/* Register Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSignUp}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                helperText="Minimal 6 karakter"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Daftar'}
              </Button>
            </form>
          </TabPanel>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              Dengan masuk, Anda setuju dengan syarat dan ketentuan GeoCetak
            </Typography>
          </Box>
        </Paper>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            🎯 Pelajari Geometri dengan Cara yang Menyenangkan<br />
            🎮 Gamifikasi & Interaksi 3D<br />
            🏆 Track Progress & Achievements
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}