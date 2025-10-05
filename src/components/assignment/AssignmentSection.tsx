// src/components/assignment/AssignmentSection.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Grid
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  Send,
  CheckCircle,
  Schedule,
  Edit,
  Description
} from '@mui/icons-material'
import { Assignment, AssignmentSubmission } from '../../services/supabase'
import {
  getAssignmentsByLesson,
  submitAssignment,
  getStudentSubmission,
  isAssignmentOverdue
} from '../../services/assignmentService'
import { supabase } from '../../services/supabase'

interface AssignmentSectionProps {
  lessonId: string
  moduleId?: string
  onComplete?: () => void
}

export const AssignmentSection: React.FC<AssignmentSectionProps> = ({
  lessonId,
  onComplete
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState<Map<string, AssignmentSubmission>>(new Map())
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
      }
    }
    fetchUser()
  }, [])

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const data = await getAssignmentsByLesson(lessonId)
        setAssignments(data)

        // Fetch existing submissions
        if (userId) {
          const submissionMap = new Map<string, AssignmentSubmission>()
          for (const assignment of data) {
            const submission = await getStudentSubmission(assignment.id, userId)
            if (submission) {
              submissionMap.set(assignment.id, submission)
            }
          }
          setSubmissions(submissionMap)
        }
      } catch (error) {
        console.error('Error loading assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (lessonId && userId) {
      fetchAssignments()
    }
  }, [lessonId, userId])

  const handleSubmit = async (assignmentId: string) => {
    if (!userId) {
      alert('Anda harus login untuk mengumpulkan tugas')
      return
    }

    if (!submissionText.trim()) {
      alert('Jawaban tidak boleh kosong')
      return
    }

    try {
      setSubmitting(true)
      const submission = await submitAssignment({
        assignmentId,
        studentId: userId,
        submissionText
      })

      // Update local state
      setSubmissions(new Map(submissions.set(assignmentId, submission)))
      setActiveAssignment(null)
      setSubmissionText('')

      if (onComplete) {
        onComplete()
      }

      alert('Tugas berhasil dikumpulkan!')
    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Gagal mengumpulkan tugas. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Tidak ada deadline'
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusChip = (assignment: Assignment) => {
    const submission = submissions.get(assignment.id)

    if (submission?.graded_at) {
      return (
        <Chip
          icon={<CheckCircle />}
          label={`Dinilai: ${submission.score || 0}/${assignment.max_score}`}
          color="success"
          size="small"
        />
      )
    }

    if (submission?.submitted_at) {
      return <Chip icon={<CheckCircle />} label="Sudah dikumpulkan" color="info" size="small" />
    }

    if (isAssignmentOverdue(assignment.due_date)) {
      return <Chip icon={<Schedule />} label="Terlambat" color="error" size="small" />
    }

    return <Chip icon={<Edit />} label="Belum dikerjakan" color="warning" size="small" />
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Memuat latihan soal...</Typography>
      </Box>
    )
  }

  if (assignments.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Belum ada latihan soal untuk lesson ini. Latihan akan segera ditambahkan.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📚 Latihan Soal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Kerjakan latihan soal berikut untuk menguji pemahaman Anda
      </Typography>

      <Stack spacing={3}>
        {assignments.map((assignment) => {
          const submission = submissions.get(assignment.id)
          const isActive = activeAssignment === assignment.id
          const isOverdue = isAssignmentOverdue(assignment.due_date)

          return (
            <Card key={assignment.id} elevation={3}>
              <CardContent>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                  <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {assignment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.description}
                    </Typography>
                  </Box>
                  {getStatusChip(assignment)}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Assignment Info */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nilai Maksimal: <strong>{assignment.max_score}</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="body2"
                      color={isOverdue ? 'error' : 'text.secondary'}
                      fontWeight={isOverdue ? 'bold' : 'normal'}
                    >
                      Deadline: {formatDate(assignment.due_date)}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Submission Form */}
                {!submission && isActive && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Jawaban Anda"
                      placeholder="Tulis jawaban Anda di sini..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      disabled={submitting}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<Send />}
                        onClick={() => handleSubmit(assignment.id)}
                        disabled={submitting || !submissionText.trim()}
                      >
                        {submitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                      </Button>
                      <Button variant="outlined" onClick={() => setActiveAssignment(null)}>
                        Batal
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* View Submission */}
                {submission && (
                  <Box sx={{ mt: 2 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Description fontSize="small" color="primary" />
                        <Typography variant="subtitle2" fontWeight="bold">
                          Jawaban Anda:
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                        {submission.submission_text}
                      </Typography>

                      {/* Teacher Feedback */}
                      {submission.teacher_feedback && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            Feedback Guru:
                          </Typography>
                          <Typography variant="body2">{submission.teacher_feedback}</Typography>
                        </Alert>
                      )}

                      {/* AI Feedback */}
                      {submission.ai_feedback && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold">
                            AI Feedback:
                          </Typography>
                          <Typography variant="body2">
                            {typeof submission.ai_feedback === 'string'
                              ? submission.ai_feedback
                              : JSON.stringify(submission.ai_feedback)}
                          </Typography>
                        </Alert>
                      )}

                      {/* Score */}
                      {submission.graded_at && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="h6" fontWeight="bold" color="success.dark">
                            Nilai: {submission.score || 0} / {assignment.max_score}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                )}

                {/* Action Button */}
                {!submission && !isActive && (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setActiveAssignment(assignment.id)}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Mulai Mengerjakan
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}
