import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material'
import {
  Timeline,
  EmojiEvents,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material'
import { useLearningStore } from '../../stores/learningStore'

const ProgressTracker: React.FC = () => {
  const { userStats, progress, modules } = useLearningStore()

  // Calculate total completed lessons
  const completedLessons = progress?.filter(p => p.status === 'completed').length || 0

  // Calculate total available lessons across all modules
  const totalLessons = modules?.reduce((sum, module) => {
    return sum + (module.lessons?.length || 6) // Fallback to 6 if no lessons array
  }, 0) || 18 // Default 18 (3 modules × 6 lessons)

  // Calculate progress percentage
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  // Get recent activity (last 5 completed lessons)
  const recentActivity = progress
    ?.filter(p => p.status === 'completed' && p.completed_at)
    .sort((a, b) => {
      const dateA = new Date(a.completed_at!).getTime()
      const dateB = new Date(b.completed_at!).getTime()
      return dateB - dateA
    })
    .slice(0, 5) || []

  // Format date to readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Baru saja'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Kemarin'
    return `${diffDays} hari yang lalu`
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Timeline />
          </Avatar>
          <Typography variant="h6" fontWeight="bold">
            Progress Pembelajaran
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Stats Section */}
        <Stack spacing={3}>
          {/* XP and Level */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#F39C12', width: 40, height: 40, mr: 1.5 }}>
                  <EmojiEvents sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Level & XP
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    Level {userStats?.level || 1}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${userStats?.total_xp || 0} XP`}
                color="warning"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </Box>

            {/* XP Progress Bar */}
            <Box mt={1}>
              <Typography variant="caption" color="textSecondary">
                Progress ke Level {(userStats?.level || 1) + 1}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((userStats?.total_xp || 0) % 500) / 5}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mt: 0.5,
                  bgcolor: 'rgba(243, 156, 18, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#F39C12'
                  }
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {500 - ((userStats?.total_xp || 0) % 500)} XP lagi
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Completed Lessons Progress */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: '#4A90E2', width: 40, height: 40, mr: 1.5 }}>
                  <CheckCircle sx={{ fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Pelajaran Selesai
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {completedLessons}/{totalLessons}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${Math.round(progressPercentage)}%`}
                color="primary"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </Box>

            {/* Lessons Progress Bar */}
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(74, 144, 226, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#4A90E2'
                }
              }}
            />
          </Box>

          <Divider />

          {/* Recent Activity */}
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp sx={{ mr: 1, color: '#27AE60' }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Aktivitas Terakhir
              </Typography>
            </Box>

            {recentActivity.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <ListItem
                    key={activity.id}
                    sx={{
                      px: 0,
                      py: 1,
                      borderBottom: index < recentActivity.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#27AE60', width: 32, height: 32 }}>
                        <CheckCircle sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="500">
                          {activity.lesson_title || `Lesson ${activity.lesson_id}`}
                        </Typography>
                      }
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(activity.completed_at)}
                          </Typography>
                          {activity.score && (
                            <>
                              <Typography variant="caption" color="textSecondary">"</Typography>
                              <Chip
                                label={`+${activity.xp_earned || 0} XP`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.7rem',
                                  bgcolor: '#27AE6020',
                                  color: '#27AE60',
                                  fontWeight: 'bold'
                                }}
                              />
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Belum ada aktivitas pembelajaran
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Mulai belajar untuk melihat progress Anda!
                </Typography>
              </Box>
            )}
          </Box>

          {/* Additional Stats Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              icon={<EmojiEvents />}
              label={`${userStats?.streak_days || 0} Hari Streak`}
              size="small"
              sx={{
                bgcolor: 'rgba(231, 76, 60, 0.1)',
                color: '#E74C3C',
                fontWeight: 'bold'
              }}
            />
            <Chip
              label={`${userStats?.badges?.length || 0} Badge`}
              size="small"
              sx={{
                bgcolor: 'rgba(155, 89, 182, 0.1)',
                color: '#9B59B6',
                fontWeight: 'bold'
              }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProgressTracker
