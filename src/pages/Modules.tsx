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
import Navbar from '../components/Navbar'

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

export default function Modules() {
  const navigate = useNavigate()
  const {
    modules,
    progress,
    loading,
    fetchModules,
    fetchUserStats,
    getModuleProgressPercentage,
    getModuleTabProgress,
    loadTabProgressFromDatabase
  } = useLearningStore()

  useEffect(() => {
    fetchModules()
    fetchUserStats()
    loadTabProgressFromDatabase() // Load progress from database
  }, [fetchModules, fetchUserStats, loadTabProgressFromDatabase])

  // Calculate module progress based on visited tabs
  const getModuleProgress = (moduleId: string | number) => {
    const id = String(moduleId)
    const percentage = getModuleProgressPercentage(id)
    const tabProgress = getModuleTabProgress(id)
    const completed = tabProgress?.visitedTabs.length || 0
    const total = 5 // Total 5 tabs per module: Konsep, Implementasi, Jaring-jaring, Rumus, Quiz
    return { completed, total, percentage }
  }

  const getModuleStatus = (moduleId: string | number) => {
    const moduleProgress = getModuleProgress(moduleId)
    if (moduleProgress.completed === moduleProgress.total) return 'completed'
    if (moduleProgress.completed > 0) return 'in-progress'
    return 'not-started'
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {/* Header Section */}
      <Paper sx={{ p: 6, mb: 6 , bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 5 }}>
            <School />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Modul Pembelajaran Geometri 3D Berbasis STEAM 📚
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Dirancang interaktif dengan dukungan 3D Printing untuk memudahkan pemahaman konsep bangun ruang.
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
              Setiap modul dirancang dengan pendekatan interaktif berbasis STEAM untuk mendukung eksplorasi visual, kemampuan berpikir geometri, serta penerapan konsep geometri dalam kehidupan nyata.
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
                          {module.title || (module as any).name}
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
                <ul style={{ listStyleType: 'disc', paddingLeft: '1em' }}>
                  <li>
                    Menjelaskan cara untuk
                    menentukan luas permukaan dan
                    volume bangun ruang (tabung, kerucut, bola).
                    dan menyelesaikan masalah yang
                    terkait.
                  </li>
                  <li>
                    Membuat jaring-jaring bangun
                    ruang (tabung, kerucut, bola) dan membuat bangun
                    ruang tersebut dari jaring-
                    Jaringnya.

                  </li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ✅ Capaian Pembelajaran
                </Typography>
                <Typography variant="body2" color="textSecondary">
                 Di akhir fase D peserta didik dapat membuat jaring-jaring bangun ruang (tabung, kerucut, bola) dan membuat bangun ruang tersebut dari jaring-jaringnya. 
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      </Container>
    </Box>
  )
}