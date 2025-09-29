// src/pages/Modules.tsx
import React, { useEffect } from 'react'
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
  Container,
  Avatar,
  Skeleton,
  Stack,
  Paper
} from '@mui/material'
import {
  ViewInAr,
  School,
  PlayArrow,
  CheckCircle,
  Assignment,
  Print,
  Timeline
} from '@mui/icons-material'
import { useLearningStore } from '../stores/learningStore'

// Module icons mapping
const moduleIcons = {
  'tabung': '🥫',
  'kerucut': '🎪',
  'bola': '⚽'
}

// Colors for modules
const moduleColors = {
  'tabung': '#4A90E2',
  'kerucut': '#E74C3C',
  'bola': '#27AE60'
}

export default function Modules() {
  const navigate = useNavigate()
  const {
    modules,
    progress,
    loading,
    fetchModules,
    fetchUserStats
  } = useLearningStore()

  useEffect(() => {
    fetchModules()
    fetchUserStats()
  }, [fetchModules, fetchUserStats])

  // Calculate module progress
  const getModuleProgress = (moduleId: number) => {
    // This would calculate based on actual lessons completed
    // For now, return dummy data based on progress
    const moduleProgress = progress.filter(p => p.lesson_id && p.lesson_id === moduleId)
    const completed = moduleProgress.length
    const total = 6 // Assuming 6 lessons per module
    return { completed, total, percentage: (completed / total) * 100 }
  }

  const getModuleStatus = (moduleId: number) => {
    const moduleProgress = getModuleProgress(moduleId)
    if (moduleProgress.completed === moduleProgress.total) return 'completed'
    if (moduleProgress.completed > 0) return 'in-progress'
    return 'not-started'
  }

  return (
    <Container maxWidth="xl">
      {/* Header Section */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 3 }}>
            <School />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Modul Pembelajaran 📚
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Jelajahi semua modul geometri 3D yang tersedia
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Setiap modul dirancang dengan pendekatan interaktif untuk memudahkan pemahaman konsep bangun ruang
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Module Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
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
                    Total Modul
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {modules.filter(m => getModuleStatus(m.id) === 'completed').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Modul Selesai
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Timeline />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {modules.filter(m => getModuleStatus(m.id) === 'in-progress').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sedang Berlangsung
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Learning Modules Grid */}
      <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
        Semua Modul Pembelajaran
      </Typography>

      <Grid container spacing={3}>
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
                          {module.name}
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
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                    </Stack>
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

      {/* Additional Information */}
      <Box mt={6}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Tentang Modul Pembelajaran
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Tujuan Pembelajaran
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Setiap modul dirancang untuk membantu siswa memahami konsep geometri 3D
                  melalui visualisasi interaktif dan eksperimen virtual.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Fitur Pembelajaran
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Model 3D interaktif, animasi jaring-jaring, kalkulator volume dan luas permukaan,
                  serta export model untuk printing 3D.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}