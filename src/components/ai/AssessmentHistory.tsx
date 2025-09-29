// src/components/ai/AssessmentHistory.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  AutoAwesome as AIIcon,
  School as TeacherIcon,
  Timer as TimerIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { aiAssessmentService, type AIAssessment } from '../../services/aiAssessmentService'

interface AssessmentHistoryProps {
  lessonId?: string
  maxItems?: number
  showLessonInfo?: boolean
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  lessonId,
  maxItems,
  showLessonInfo = true
}) => {
  const [assessments, setAssessments] = useState<AIAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedAssessment, setSelectedAssessment] = useState<AIAssessment | null>(null)

  useEffect(() => {
    fetchAssessments()
  }, [lessonId])

  const fetchAssessments = async () => {
    try {
      setLoading(true)
      const data = await aiAssessmentService.getAssessmentHistory(lessonId)

      // Apply maxItems limit if specified
      const limitedData = maxItems ? data.slice(0, maxItems) : data
      setAssessments(limitedData)

    } catch (err) {
      console.warn('Assessment service not available:', err)
      // Use empty array as fallback - this prevents the component from breaking
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'success'
    if (score >= 70) return 'primary'
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'primary'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai'
      case 'processing': return 'Memproses'
      case 'failed': return 'Gagal'
      case 'pending': return 'Menunggu'
      default: return status
    }
  }

  const calculateAverageScore = () => {
    const completedAssessments = assessments.filter(a => a.status === 'completed' && a.ai_score)
    if (completedAssessments.length === 0) return 0
    
    const sum = completedAssessments.reduce((acc, assessment) => acc + (assessment.ai_score || 0), 0)
    return Math.round(sum / completedAssessments.length)
  }

  const getImprovementTrend = () => {
    const completedAssessments = assessments
      .filter(a => a.status === 'completed' && a.ai_score)
      .slice(0, 5) // Last 5 assessments
      .reverse() // Chronological order
    
    if (completedAssessments.length < 2) return null
    
    const firstScore = completedAssessments[0].ai_score!
    const lastScore = completedAssessments[completedAssessments.length - 1].ai_score!
    
    return lastScore - firstScore
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Memuat riwayat penilaian...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchAssessments}>
          Coba Lagi
        </Button>
      }>
        {error}
      </Alert>
    )
  }

  if (assessments.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <AssessmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Belum Ada Penilaian
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mulai mengerjakan soal essay untuk melihat riwayat penilaian AI
        </Typography>
      </Paper>
    )
  }

  const averageScore = calculateAverageScore()
  const improvementTrend = getImprovementTrend()

  return (
    <Box>
      {/* Summary Statistics */}
      {assessments.length > 1 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h6" gutterBottom>
            📊 Ringkasan Performa
          </Typography>
          
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Penilaian
              </Typography>
              <Typography variant="h5">
                {assessments.length}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Rata-rata Skor
              </Typography>
              <Typography variant="h5">
                <Chip 
                  label={`${averageScore}/100`}
                  color={getScoreColor(averageScore)}
                  size="medium"
                />
              </Typography>
            </Box>
            
            {improvementTrend !== null && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tren Perkembangan
                </Typography>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon 
                    color={improvementTrend >= 0 ? 'success' : 'error'} 
                    sx={{ mr: 1 }}
                  />
                  <Typography 
                    variant="h6" 
                    color={improvementTrend >= 0 ? 'success.main' : 'error.main'}
                  >
                    {improvementTrend >= 0 ? '+' : ''}{improvementTrend} poin
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Assessment List */}
      <Typography variant="h6" gutterBottom>
        Riwayat Penilaian
      </Typography>

      {assessments.map((assessment, index) => (
        <Card key={assessment.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box flex={1}>
                {showLessonInfo && (
                  <Typography variant="body2" color="primary.main" fontWeight="medium">
                    {/* @ts-ignore - lessons relationship */}
                    {assessment.lessons?.title || 'Lesson'}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(assessment.created_at), 'PPpp', { locale: idLocale })}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1, maxWidth: '80%' }}>
                  {assessment.problem_text.length > 100 
                    ? `${assessment.problem_text.substring(0, 100)}...`
                    : assessment.problem_text
                  }
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={getStatusLabel(assessment.status)}
                  color={getStatusColor(assessment.status)}
                  size="small"
                />
                
                {assessment.status === 'completed' && assessment.ai_score && (
                  <Chip 
                    label={`${assessment.ai_score}/100`}
                    color={getScoreColor(assessment.ai_score)}
                    size="small"
                  />
                )}

                {assessment.teacher_review && (
                  <Tooltip title="Sudah direview guru">
                    <TeacherIcon color="primary" fontSize="small" />
                  </Tooltip>
                )}

                <IconButton
                  size="small"
                  onClick={() => toggleExpanded(assessment.id)}
                  sx={{
                    transform: expandedItems.has(assessment.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => setSelectedAssessment(assessment)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedItems.has(assessment.id)}>
              <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {/* Student Answer Preview */}
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Jawaban Anda:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {assessment.student_answer.length > 200
                    ? `${assessment.student_answer.substring(0, 200)}...`
                    : assessment.student_answer
                  }
                </Typography>

                {/* AI Feedback Preview */}
                {assessment.status === 'completed' && assessment.ai_feedback && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Feedback AI:
                    </Typography>
                    <Alert 
                      severity={assessment.ai_score! >= 70 ? 'success' : 'info'}
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="body2">
                        {assessment.ai_feedback.detailedFeedback.length > 150
                          ? `${assessment.ai_feedback.detailedFeedback.substring(0, 150)}...`
                          : assessment.ai_feedback.detailedFeedback
                        }
                      </Typography>
                    </Alert>

                    {/* Processing Time */}
                    {assessment.processing_time_ms && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <TimerIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Diproses dalam {(assessment.processing_time_ms / 1000).toFixed(1)} detik
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Teacher Comments */}
                {assessment.teacher_comments && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">
                      💬 Komentar Guru:
                    </Typography>
                    <Typography variant="body2">
                      {assessment.teacher_comments}
                    </Typography>
                    {assessment.teacher_override_score && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Skor Manual:</strong> {assessment.teacher_override_score}/100
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}

      {/* Detailed Assessment Dialog */}
      <Dialog
        open={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <AIIcon color="primary" />
            Detail Penilaian AI
            {selectedAssessment?.ai_score && (
              <Chip 
                label={`${selectedAssessment.ai_score}/100`}
                color={getScoreColor(selectedAssessment.ai_score)}
              />
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedAssessment && (
            <Box>
              {/* Problem & Answer */}
              <Typography variant="h6" gutterBottom>Soal:</Typography>
              <Typography variant="body1" paragraph sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {selectedAssessment.problem_text}
              </Typography>

              <Typography variant="h6" gutterBottom>Jawaban Anda:</Typography>
              <Typography variant="body1" paragraph sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {selectedAssessment.student_answer}
              </Typography>

              {/* AI Feedback */}
              {selectedAssessment.status === 'completed' && selectedAssessment.ai_feedback && (
                <>
                  <Typography variant="h6" gutterBottom>Penilaian Detail:</Typography>
                  
                  {/* Criteria Scores */}
                  {Object.entries(selectedAssessment.ai_feedback.criteriaScores).map(([criteria, score]) => (
                    <Box key={criteria} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        {criteria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(score / 4) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={score >= 3 ? 'success' : score >= 2 ? 'primary' : 'warning'}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {score}/4
                      </Typography>
                    </Box>
                  ))}

                  {/* Detailed Feedback */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {selectedAssessment.ai_feedback.detailedFeedback}
                  </Alert>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSelectedAssessment(null)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}