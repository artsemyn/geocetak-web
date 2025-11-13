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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
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
  const [schoolName, setSchoolName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [classCode, setClassCode] = useState('')
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
      await signUp(email, password, fullName, schoolName, gradeLevel, classCode)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {/* Logo & Brand */}
          <Box display="flex" alignItems="center" mb={4}>
            <Calculate sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Typography variant="h3" component="h1" fontWeight="bold" color="white">
              GeoCetak
            </Typography>
          </Box>

          <Typography variant="subtitle1" color="rgba(255,255,255,0.8)" mb={4} textAlign="center">
            Platform Pembelajaran Geometri 3D Interaktif
          </Typography>

          <Paper
            elevation={8}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
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
                label="Nama Sekolah"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                placeholder="Contoh: SMP Negeri 1 Jakarta"
              />
              <FormControl fullWidth margin="normal" required disabled={loading}>
                <InputLabel>Kelas</InputLabel>
                <Select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  label="Kelas"
                >
                  <MenuItem value="7">Kelas 7</MenuItem>
                  <MenuItem value="8">Kelas 8</MenuItem>
                  <MenuItem value="9">Kelas 9</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Kode Kelas (Opsional)"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                margin="normal"
                disabled={loading}
                placeholder="Contoh: GEO-7A"
                helperText="Masukkan kode kelas jika guru Anda memberikannya"
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
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              🎯 Pelajari Geometri dengan Cara yang Menyenangkan<br />
              🎮 Gamifikasi & Interaksi 3D<br />
              🏆 Track Progress & Achievements
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}