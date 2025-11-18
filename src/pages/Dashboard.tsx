// src/pages/Dashboard.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Avatar,
  Container,
  Alert,
  Skeleton
} from '@mui/material'
import {
  ViewInAr,
  School,
  PlayArrow,
  CheckCircle,
  Stars,
  TrendingUp,
  Assignment,
  Print
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useLearningStore } from '../stores/learningStore'
import { supabase } from '../services/supabase'
import Navbar from '../components/Navbar'
import ProgressTracker from '../components/learning/ProgressTracker'

// Module icons mapping
const moduleIcons = {
  'tabung': '🥫',
  'kerucut': '🎉',
  'bola': '⚽'
}

// Colors for modules
const moduleColors = {
  'tabung': '#4A90E2',
  'kerucut': '#E74C3C',
  'bola': '#27AE60'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const {
    modules,
    userStats,
    progress,
    lessons,
    loading,
    fetchModules,
    fetchUserStats,
    fetchProgress,
    fetchRecentActivity,
    fetchLessons
  } = useLearningStore()

  useEffect(() => {
    const fetchData = async () => {
      // First fetch modules
      await fetchModules()

      // Wait a bit and get modules from state after fetch completes
      const allModules = useLearningStore.getState().modules
      console.log('📚 Modules loaded:', allModules.length, allModules.map(m => ({ id: m.id, title: m.title })))

      // Fetch user data
      await fetchUserStats()

      // Fetch user progress
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('👤 User authenticated:', user.id)
        await fetchProgress(user.id)
        await fetchRecentActivity()

        const currentProgress = useLearningStore.getState().progress
        console.log('📈 Progress loaded:', currentProgress.length, currentProgress)
      }

      // Fetch all lessons for each module for progress calculation
      if (allModules && allModules.length > 0) {
        for (const module of allModules) {
          await fetchLessons(module.id)
        }
        const allLessons = useLearningStore.getState().lessons
        console.log('📖 All lessons loaded:', allLessons.length, allLessons.map(l => ({ id: l.id, module_id: l.module_id, title: l.title })))
      }
    }

    fetchData()
  }, [fetchModules, fetchUserStats, fetchProgress, fetchRecentActivity, fetchLessons])

  // Calculate module progress based on real data
  const getModuleProgress = (moduleId: string) => {
    // Get lessons for this module
    const moduleLessons = lessons.filter(l => l.module_id === moduleId)
    const totalLessons = moduleLessons.length || 6 // Fallback to 6

    // Get completed lessons from progress
    const completedLessons = progress.filter(p =>
      moduleLessons.some(l => l.id === p.lesson_id) &&
      p.status === 'completed'
    ).length

    // Debug logging
    console.log(`Module ${moduleId} progress:`, {
      totalLessons: moduleLessons.length,
      moduleLessonIds: moduleLessons.map(l => l.id),
      totalProgress: progress.length,
      progressLessonIds: progress.map(p => p.lesson_id),
      completed: completedLessons,
      fallbackUsed: moduleLessons.length === 0
    })

    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
    }
  }

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = getModuleProgress(moduleId)
    if (moduleProgress.completed === moduleProgress.total && moduleProgress.total > 0) return 'completed'
    if (moduleProgress.completed > 0) return 'in-progress'
    return 'not-started'
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Welcome Section */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Selamat Datang, {profile?.full_name || 'Pelajar'}! 👋
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Mari lanjutkan perjalanan belajar geometri 3D Anda
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Jelajahi dunia bangun ruang sisi lengkung dengan interaksi 3D yang menyenangkan
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} textAlign="center">
            {userStats ? (
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  Level {userStats.level}
                </Typography>
                <Typography variant="body1">
                  {userStats.total_xp} XP Total
                </Typography>
                <Typography variant="body2">
                  Streak: {userStats.streak_days} hari
                </Typography>
              </Box>
            ) : (
              <Skeleton variant="rectangular" height={100} />
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {modules.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Modul Tersedia
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {progress.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pelajaran Selesai
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Stars />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats?.total_xp || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total XP
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {userStats?.streak_days || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Hari Beruntun
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Tracker */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={6}>
          <ProgressTracker />
        </Grid>
        <Grid item xs={12} lg={6}>
          {/* Placeholder for future features like Recent Activity or Achievements */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Tips Belajar 💡
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Selesaikan pelajaran setiap hari untuk menjaga streak Anda
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Interaksi dengan model 3D untuk pemahaman yang lebih baik
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • Kumpulkan XP untuk naik level dan buka badge
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Jangan lupa kerjakan latihan soal di setiap modul
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Learning Modules */}
      <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
        Modul Pembelajaran 📚
      </Typography>

      <Grid container spacing={3} mb={4}>
        {loading ? (
          // Show skeleton loaders while loading
          Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="rectangular" height={8} sx={{ my: 2 }} />
                  <Box display="flex" gap={1}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id)
          const status = getModuleStatus(module.id)
          
          return (
            <Grid item xs={12} md={4} key={module.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate(`/module/${module.slug}`)}
              >
                <CardContent>
                  {/* Module Header */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h3" mr={2}>
                      {moduleIcons[module.slug as keyof typeof moduleIcons]}
                    </Typography>
                    <Box flexGrow={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {module.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        status === 'completed' ? 'Selesai' :
                        status === 'in-progress' ? 'Berlangsung' : 'Belum Mulai'
                      }
                      color={
                        status === 'completed' ? 'success' :
                        status === 'in-progress' ? 'warning' : 'default'
                      }
                      size="small"
                    />
                  </Box>

                  {/* Progress */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">
                        Progress
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {moduleProgress.completed}/{moduleProgress.total} Pelajaran
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={moduleProgress.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: moduleColors[module.slug as keyof typeof moduleColors]
                        }
                      }}
                    />
                  </Box>

                  {/* Features */}
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip
                      icon={<ViewInAr />}
                      label="3D Interaktif"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Assignment />}
                      label="Net Animation"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Print />}
                      label="3D Export"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrow />}
                    sx={{
                      bgcolor: moduleColors[module.slug as keyof typeof moduleColors],
                      '&:hover': {
                        bgcolor: moduleColors[module.slug as keyof typeof moduleColors],
                        opacity: 0.8
                      }
                    }}
                  >
                    {status === 'not-started' ? 'Mulai Belajar' : 'Lanjutkan'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })
        )}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
        Aktivitas Terbaru 📈
      </Typography>

      <Card>
        <CardContent>
          {progress.length > 0 ? (
            <Box>
              {progress.slice(0, 5).map((item, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  py={2}
                  borderBottom={index < 4 ? 1 : 0}
                  borderColor="grey.200"
                >
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <CheckCircle />
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography variant="body1" fontWeight="medium">
                      Menyelesaikan pelajaran
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Mendapatkan {item.xp_earned} XP
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'Baru saja'}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              Belum ada aktivitas pembelajaran. Mulai pelajaran pertama Anda!
            </Alert>
          )}
        </CardContent>
      </Card>
      </Container>
    </Box>
  )
}