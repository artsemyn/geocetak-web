// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react'
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import {
  Person,
  Email,
  School as SchoolIcon,
  Class as ClassIcon,
  Edit,
  Save,
  Cancel,
  EmojiEvents,
  Settings
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useLearningStore } from '../stores/learningStore'
import { supabase } from '../services/supabase'
import Navbar from '../components/Navbar'

export default function Profile() {
  const { user, profile, fetchProfile } = useAuthStore()
  const { userStats, fetchUserStats } = useLearningStore()

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    school_name: '',
    grade_level: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        school_name: profile.school_name || '',
        grade_level: profile.grade_level || ''
      })
    } else if (user) {
      fetchProfile()
    }

    // Fetch user stats
    fetchUserStats()
  }, [profile, user, fetchUserStats])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          school_name: formData.school_name,
          grade_level: formData.grade_level
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Profile berhasil diupdate!')
      setEditing(false)
      await fetchProfile()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Gagal update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        school_name: profile.school_name || '',
        grade_level: profile.grade_level || ''
      })
    }
    setEditing(false)
    setError('')
  }

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 3 }}>
        {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            src={profile.avatar_url || undefined}
            sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', fontSize: 32 }}
          >
            {profile.full_name?.charAt(0) || 'U'}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
              {profile.full_name || 'User'}
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.9)">
              {profile.email}
            </Typography>
            <Chip
              icon={<EmojiEvents />}
              label={`Level ${userStats?.level || 1} • ${userStats?.total_xp || 0} XP`}
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>
          {!editing && (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              Edit Profile
            </Button>
          )}
        </Box>
      </Paper>

      {/* Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Profile Details */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Informasi Siswa
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Full Name */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Person color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Nama Lengkap
              </Typography>
            </Box>
            {editing ? (
              <TextField
                fullWidth
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                disabled={loading}
                required
              />
            ) : (
              <Typography variant="body1" fontWeight="500" ml={5}>
                {profile.full_name || '-'}
              </Typography>
            )}
          </Grid>

          {/* Email */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Email color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight="500" ml={5} color="text.secondary">
              {profile.email || '-'}
            </Typography>
            {editing && (
              <Typography variant="caption" color="text.secondary" ml={5}>
                Email tidak dapat diubah
              </Typography>
            )}
          </Grid>

          {/* School Name */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <SchoolIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Nama Sekolah
              </Typography>
            </Box>
            {editing ? (
              <TextField
                fullWidth
                value={formData.school_name}
                onChange={(e) => handleChange('school_name', e.target.value)}
                disabled={loading}
                placeholder="Contoh: SMP Negeri 1 Jakarta"
              />
            ) : (
              <Typography variant="body1" fontWeight="500" ml={5}>
                {profile.school_name || '-'}
              </Typography>
            )}
          </Grid>

          {/* Grade Level */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <ClassIcon color="primary" />
              <Typography variant="subtitle2" color="text.secondary">
                Kelas
              </Typography>
            </Box>
            {editing ? (
              <FormControl fullWidth disabled={loading}>
                <Select
                  value={formData.grade_level}
                  onChange={(e) => handleChange('grade_level', e.target.value)}
                >
                  <MenuItem value="7">Kelas 7</MenuItem>
                  <MenuItem value="8">Kelas 8</MenuItem>
                  <MenuItem value="9">Kelas 9</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <Typography variant="body1" fontWeight="500" ml={5}>
                {profile.grade_level ? `Kelas ${profile.grade_level}` : '-'}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Action Buttons */}
        {editing && (
          <Box display="flex" gap={2} mt={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSave}
              disabled={loading}
            >
              Simpan Perubahan
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={loading}
            >
              Batal
            </Button>
          </Box>
        )}
      </Paper>

      {/* Stats Card */}
      <Card elevation={2} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Statistik Belajar
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {userStats?.level || 1}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Level
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="secondary" fontWeight="bold">
                  {userStats?.total_xp || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total XP
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {userStats?.streak_days || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hari Beruntun
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box textAlign="center" p={2}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {userStats?.badges?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Badge
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </Container>
    </Box>
  )
}