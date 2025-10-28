// src/pages/Assessment.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Assignment,
  Timer,
  CheckCircle,
  PlayArrow,
  Info,
  NavigateNext,
  NavigateBefore,
  Send,
  Cancel as CancelIcon,
  ArrowBack
} from '@mui/icons-material'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { aiAssessmentService } from '../services/aiAssessmentService'
import Navbar from '../components/Navbar'

interface AssignmentWithDetails {
  id: string
  title: string
  description?: string
  assignment_type: string
  lesson_id?: string
  module_id?: string
  assigned_to_classroom?: string
  assigned_by?: string
  start_date?: string
  due_date?: string
  time_limit_minutes?: number
  total_points: number
  passing_score?: number
  max_attempts?: number
  show_correct_answers?: boolean
  shuffle_questions?: boolean
  status: string
  question_count: number
  essay_count: number
  mc_count: number
  has_attempted: boolean
  attempt_count?: number
  best_score?: number
  last_submission?: string
  current_submission_status?: string
  lesson_title?: string
  module_title?: string
}

interface Question {
  id: string
  assignment_id: string
  question_text: string
  question_type: 'multiple_choice' | 'essay' | 'short_answer'
  options?: string[]
  correct_answer?: string
  explanation?: string
  difficulty: string
  points: number
  order_index: number
  max_words?: number
  image_url?: string
  video_url?: string
  rubric?: any
}

interface Answer {
  questionId: string
  answer: string
  isCorrect?: boolean
  aiScore?: number
  timeSpent: number
  pointsEarned?: number
  pointsPossible?: number
}

interface Submission {
  id?: string
  assignment_id: string
  student_id: string
  answers: any
  started_at: string
  submitted_at?: string
  status: string
  score?: number
  max_score?: number
  percentage?: number
  passed?: boolean
  attempt_number?: number
  time_spent_seconds?: number
  ai_graded?: boolean
  ai_feedback?: any
}

export default function Assessment() {
  const { user } = useAuthStore()

  // List View States
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Assignment View States
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [currentAssignmentData, setCurrentAssignmentData] = useState<AssignmentWithDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [showResults, setShowResults] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Fetch assignment list on mount
  useEffect(() => {
    if (user && !selectedAssignment) {
      fetchAssignments()
    }
  }, [user, selectedAssignment])

  const fetchAssignments = async () => {
    try {
      setLoadingList(true)

      // Fetch all assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false })

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
        throw assignmentsError
      }

      if (!assignmentsData || assignmentsData.length === 0) {
        setAssignments([])
        return
      }

      // Fetch questions count for each assignment
      const assignmentsList: AssignmentWithDetails[] = []

      for (const assignment of assignmentsData) {

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('assignment_questions')
          .select('question_type, points')
          .eq('assignment_id', assignment.id)

        if (questionsError) {
          console.error(`Error fetching questions for ${assignment.id}:`, questionsError)
        }

        const questionCount = questionsData?.length || 0
        const essayCount = questionsData?.filter(q => q.question_type === 'essay').length || 0
        const mcCount = questionsData?.filter(q => q.question_type === 'multiple_choice').length || 0
        const totalPoints = assignment.total_points || questionsData?.reduce((sum, q) => sum + (q.points || 0), 0) || 0

        // Fetch lesson info separately if needed
        let lessonTitle = undefined
        let moduleTitle = undefined

        if (assignment.lesson_id) {
          const { data: lessonData } = await supabase
            .from('lessons')
            .select('title, module_id')
            .eq('id', assignment.lesson_id)
            .single()

          if (lessonData) {
            lessonTitle = lessonData.title

            // Fetch module title separately
            if (lessonData.module_id) {
              const { data: moduleData } = await supabase
                .from('modules')
                .select('title')
                .eq('id', lessonData.module_id)
                .single()

              if (moduleData) {
                moduleTitle = moduleData.title
              }
            }
          }
        }

        // Fetch user's submissions for this assignment
        let hasAttempted = false
        let attemptCount = 0
        let bestScore = undefined
        let lastSubmission = undefined
        let currentStatus = undefined

        if (user) {
          const { data: submissionsData } = await supabase
            .from('assignment_submissions')
            .select('score, max_score, submitted_at, status, attempt_number')
            .eq('assignment_id', assignment.id)
            .eq('student_id', user.id)
            .order('submitted_at', { ascending: false })

          if (submissionsData && submissionsData.length > 0) {
            hasAttempted = true
            attemptCount = submissionsData.length
            bestScore = Math.max(...submissionsData.map(s => s.score || 0))
            lastSubmission = submissionsData[0].submitted_at
            currentStatus = submissionsData[0].status
          }
        }

        assignmentsList.push({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          assignment_type: assignment.assignment_type,
          lesson_id: assignment.lesson_id,
          module_id: assignment.module_id,
          assigned_to_classroom: assignment.assigned_to_classroom,
          assigned_by: assignment.assigned_by,
          start_date: assignment.start_date,
          due_date: assignment.due_date,
          time_limit_minutes: assignment.time_limit_minutes,
          total_points: totalPoints,
          passing_score: assignment.passing_score,
          max_attempts: assignment.max_attempts,
          show_correct_answers: assignment.show_correct_answers,
          shuffle_questions: assignment.shuffle_questions,
          status: assignment.status || 'active',
          question_count: questionCount,
          essay_count: essayCount,
          mc_count: mcCount,
          has_attempted: hasAttempted,
          attempt_count: attemptCount,
          best_score: bestScore,
          last_submission: lastSubmission,
          current_submission_status: currentStatus,
          lesson_title: lessonTitle,
          module_title: moduleTitle
        })
      }

      console.log('✅ Final assignments list:', assignmentsList)
      setAssignments(assignmentsList)

    } catch (error: any) {
      console.error('❌ Error fetching assignments:', error)
      alert(`Failed to load assignments: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoadingList(false)
    }
  }

  const handleStartAssignment = async (assignmentId: string) => {
    setSelectedAssignment(assignmentId)
    setLoadingQuestions(true)

    try {
      // Find assignment data
      const assignmentData = assignments.find(a => a.id === assignmentId)
      if (!assignmentData) throw new Error('Assignment not found')

      setCurrentAssignmentData(assignmentData)

      // Check if max attempts reached
      if (assignmentData.max_attempts && assignmentData.attempt_count &&
          assignmentData.attempt_count >= assignmentData.max_attempts) {
        alert(`Anda telah mencapai batas maksimal percobaan (${assignmentData.max_attempts}x)`)
        setSelectedAssignment(null)
        setLoadingQuestions(false)
        return
      }

      // Fetch questions
      const { data, error } = await supabase
        .from('assignment_questions')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('order_index')

      if (error) throw error

      // Parse options for multiple choice questions
      let parsedQuestions = data?.map(q => ({
        ...q,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined,
        rubric: q.rubric ? (typeof q.rubric === 'string' ? JSON.parse(q.rubric) : q.rubric) : undefined
      })) || []

      // Shuffle questions if required
      if (assignmentData.shuffle_questions) {
        parsedQuestions = parsedQuestions.sort(() => Math.random() - 0.5)
      }

      setQuestions(parsedQuestions)
      setSessionStartTime(Date.now())
      setQuestionStartTime(Date.now())
      setCurrentQuestionIndex(0)
      setAnswers([])
      setCurrentAnswer('')
      setShowResults(false)

      // Create initial submission record
      const attemptNumber = (assignmentData.attempt_count || 0) + 1
      const { data: submissionData, error: submissionError } = await supabase
        .from('assignment_submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user!.id,
          started_at: new Date().toISOString(),
          status: 'in_progress',
          answers: {},
          attempt_number: attemptNumber
        })
        .select()
        .single()

      if (submissionError) throw submissionError
      setCurrentSubmissionId(submissionData.id)

    } catch (error) {
      console.error('Error starting assignment:', error)
      alert('Gagal memuat soal assignment')
      setSelectedAssignment(null)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

    // For multiple choice, check if correct
    const isCorrect = currentQuestion.question_type === 'multiple_choice'
      ? currentAnswer === currentQuestion.correct_answer
      : undefined

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      isCorrect,
      timeSpent
    }

    setAnswers([...answers, newAnswer])
    setCurrentAnswer('')
    setQuestionStartTime(Date.now())

    if (isLastQuestion) {
      await handleSubmitAssignment([...answers, newAnswer])
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Load previous answer if exists
      const prevAnswer = answers[currentQuestionIndex - 1]
      if (prevAnswer) {
        setCurrentAnswer(prevAnswer.answer)
      }
    }
  }

  const handleSubmitAssignment = async (finalAnswers: Answer[]) => {
    if (!user || !currentSubmissionId || !currentAssignmentData) return

    setSubmitting(true)

    try {
      // Calculate scores
      const mcQuestions = questions.filter(q => q.question_type === 'multiple_choice')
      const essayQuestions = questions.filter(q => q.question_type === 'essay')

      const mcAnswers = finalAnswers.filter(a => {
        const q = questions.find(qu => qu.id === a.questionId)
        return q?.question_type === 'multiple_choice'
      })

      const mcScore = mcAnswers.reduce((acc, answer) => {
        const question = questions.find(q => q.id === answer.questionId)
        const pointsEarned = answer.isCorrect ? question?.points || 0 : 0
        answer.pointsEarned = pointsEarned
        answer.pointsPossible = question?.points || 0
        return acc + pointsEarned
      }, 0)

      const maxMCScore = mcQuestions.reduce((acc, q) => acc + q.points, 0)

      // For essay questions, submit to AI for evaluation
      const essayAnswers = finalAnswers.filter(a => {
        const q = questions.find(qu => qu.id === a.questionId)
        return q?.question_type === 'essay'
      })

      let essayScoresTotal = 0
      const maxEssayScore = essayQuestions.reduce((acc, q) => acc + q.points, 0)
      const aiFeedback: any[] = []

      for (const answer of essayAnswers) {
        const question = questions.find(q => q.id === answer.questionId)
        if (question) {
          try {
            const evaluation = await aiAssessmentService.submitForEvaluation({
              problemText: question.question_text,
              studentAnswer: answer.answer,
              lessonId: currentAssignmentData.lesson_id || '',
              geometryType: 'cylinder' // This should be dynamic based on lesson
            })

            // Convert AI score (0-100) to question points
            const questionScore = (evaluation.feedback.overallScore / 100) * question.points
            essayScoresTotal += questionScore

            // Update answer with AI score
            answer.aiScore = evaluation.feedback.overallScore
            answer.pointsEarned = questionScore
            answer.pointsPossible = question.points

            aiFeedback.push({
              questionId: question.id,
              feedback: evaluation.feedback
            })
          } catch (error) {
            console.error('Error evaluating essay:', error)
            answer.pointsEarned = 0
            answer.pointsPossible = question.points
          }
        }
      }

      const totalScore = mcScore + essayScoresTotal
      const maxScore = maxMCScore + maxEssayScore
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
      const passed = currentAssignmentData.passing_score
        ? percentage >= currentAssignmentData.passing_score
        : percentage >= 60

      // Save assignment submission
      const totalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)

      await supabase
        .from('assignment_submissions')
        .update({
          answers: finalAnswers,
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          score: Math.round(totalScore),
          max_score: maxScore,
          percentage: Math.round(percentage),
          passed: passed,
          time_spent_seconds: totalTimeSpent,
          ai_graded: essayQuestions.length > 0,
          ai_feedback: aiFeedback.length > 0 ? aiFeedback : null
        })
        .eq('id', currentSubmissionId)

      // Save individual question grades
      for (const answer of finalAnswers) {
        await supabase.from('assignment_grades').insert({
          submission_id: currentSubmissionId,
          question_id: answer.questionId,
          student_answer: answer.answer,
          points_earned: Math.round(answer.pointsEarned || 0),
          points_possible: answer.pointsPossible || 0,
          is_correct: answer.isCorrect,
          ai_feedback: answer.aiScore ? { score: answer.aiScore } : null
        })
      }

      // Update student progress if linked to lesson
      if (currentAssignmentData.lesson_id) {
        await supabase.from('student_progress').upsert({
          user_id: user.id,
          lesson_id: currentAssignmentData.lesson_id,
          status: passed ? 'completed' : 'in_progress',
          completion_percentage: Math.round(percentage),
          quiz_score: Math.round(totalScore)
        })
      }

      setShowResults(true)

    } catch (error) {
      console.error('Error submitting assignment:', error)
      alert('Gagal menyimpan hasil assignment. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToList = () => {
    setSelectedAssignment(null)
    setCurrentAssignmentData(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setShowResults(false)
    setCurrentSubmissionId(null)
    fetchAssignments()
  }

  const handleRetry = () => {
    if (selectedAssignment) {
      handleStartAssignment(selectedAssignment)
    }
  }

  // RENDER: Loading List
  if (loadingList && !selectedAssignment) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </>
    )
  }

  // RENDER: Loading Questions
  if (loadingQuestions) {
    return (
      <>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography ml={2}>Memuat soal...</Typography>
        </Box>
      </>
    )
  }

  // RENDER: Results View
  if (showResults && selectedAssignment && currentAssignmentData) {
    const totalScore = answers.reduce((acc, a) => {
      const q = questions.find(qu => qu.id === a.questionId)
      if (q?.question_type === 'multiple_choice') {
        return acc + (a.isCorrect ? q.points : 0)
      } else {
        return acc + ((a.aiScore || 0) / 100) * (q?.points || 0)
      }
    }, 0)

    const maxScore = questions.reduce((acc, q) => acc + q.points, 0)
    const percentage = (totalScore / maxScore) * 100
    const passingThreshold = currentAssignmentData.passing_score || 60
    const passed = percentage >= passingThreshold

    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            {passed ? (
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            )}

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {passed ? 'Selamat!' : 'Tetap Semangat!'}
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Skor Anda: {Math.round(totalScore)}/{maxScore} ({percentage.toFixed(0)}%)
            </Typography>

            <Typography variant="body1" color="text.secondary">
              Nilai Lulus: {passingThreshold}%
            </Typography>

            {currentAssignmentData.attempt_count && currentAssignmentData.max_attempts && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Percobaan {currentAssignmentData.attempt_count + 1} dari {currentAssignmentData.max_attempts}
              </Typography>
            )}
          </Box>

          {/* Question Review */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Review Jawaban:
            </Typography>
            {questions.map((question, index) => {
              const answer = answers.find(a => a.questionId === question.id)
              const isCorrect = answer?.isCorrect ?? (answer?.aiScore && answer.aiScore >= 70)

              return (
                <Card key={question.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Chip
                        label={`Soal ${index + 1}`}
                        color={isCorrect ? 'success' : 'error'}
                        icon={isCorrect ? <CheckCircle /> : <CancelIcon />}
                      />
                      <Chip label={`${question.points} poin`} variant="outlined" />
                    </Box>

                    <Typography variant="body1" paragraph>
                      {question.question_text}
                    </Typography>

                    {question.question_type === 'multiple_choice' && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Jawaban Anda: {answer?.answer}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          Jawaban Benar: {question.correct_answer}
                        </Typography>
                        {question.explanation && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            {question.explanation}
                          </Alert>
                        )}
                      </>
                    )}

                    {question.question_type === 'essay' && answer?.aiScore && (
                      <Chip
                        label={`Skor AI: ${answer.aiScore}/100`}
                        color={answer.aiScore >= 70 ? 'success' : 'warning'}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </Box>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBackToList}
            >
              Kembali ke Daftar
            </Button>
            <Button
              variant="contained"
              onClick={handleRetry}
            >
              Coba Lagi
            </Button>
          </Box>
        </Paper>
        </Container>
      </>
    )
  }

  // RENDER: Assignment Form View
  if (selectedAssignment && questions.length > 0 && currentAssignmentData) {
    const elapsedMinutes = Math.floor((Date.now() - sessionStartTime) / 60000)
    const timeLimit = currentAssignmentData.time_limit_minutes
    const timeRemaining = timeLimit ? timeLimit - elapsedMinutes : null

    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Progress Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6">
                {currentAssignmentData.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </Typography>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <Timer />
              <Box>
                <Typography variant="body2">
                  {elapsedMinutes} menit
                </Typography>
                {timeRemaining !== null && (
                  <Typography
                    variant="caption"
                    color={timeRemaining < 5 ? 'error' : 'text.secondary'}
                  >
                    Sisa: {timeRemaining} menit
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />

          <Stepper activeStep={currentQuestionIndex} sx={{ mt: 2 }}>
            {questions.map((_, index) => (
              <Step key={index}>
                <StepLabel />
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Question Card */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" gap={2} mb={3}>
            <Chip
              label={currentQuestion.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
              color="primary"
            />
            <Chip label={`${currentQuestion.points} poin`} variant="outlined" />
            <Chip
              label={currentQuestion.difficulty === 'easy' ? 'Mudah' : currentQuestion.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
              color={currentQuestion.difficulty === 'easy' ? 'success' : currentQuestion.difficulty === 'medium' ? 'warning' : 'error'}
            />
          </Box>

          <Typography variant="h6" paragraph>
            {currentQuestion.question_text}
          </Typography>

          {/* Multiple Choice Options */}
          {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={currentAnswer} onChange={(e) => handleAnswerChange(e.target.value)}>
                {currentQuestion.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    sx={{
                      border: '1px solid',
                      borderColor: currentAnswer === option ? 'primary.main' : 'grey.300',
                      borderRadius: 1,
                      mb: 1,
                      p: 1
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* Essay Answer */}
          {currentQuestion.question_type === 'essay' && (
            <TextField
              multiline
              rows={8}
              fullWidth
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Tuliskan jawaban Anda dengan lengkap. Jelaskan langkah-langkah penyelesaian dan rumus yang digunakan..."
              sx={{ mb: 2 }}
            />
          )}

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Sebelumnya
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => setShowExitDialog(true)}
              >
                Keluar
              </Button>
            </Box>

            <Button
              variant="contained"
              endIcon={isLastQuestion ? <Send /> : <NavigateNext />}
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim() || submitting}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : isLastQuestion ? (
                'Submit'
              ) : (
                'Selanjutnya'
              )}
            </Button>
          </Box>
        </Paper>

        {/* Exit Confirmation Dialog */}
        <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
          <DialogTitle>Keluar dari Assignment?</DialogTitle>
          <DialogContent>
            <Typography>
              Progress Anda belum tersimpan. Apakah Anda yakin ingin keluar?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowExitDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleBackToList} color="error">
              Ya, Keluar
            </Button>
          </DialogActions>
        </Dialog>
        </Container>
      </>
    )
  }

  // RENDER: Assignment List (Default View)
  return (
    <>
      <Navbar />
      <Box sx={{ py: 4, px: 3 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, mx: 'auto', maxWidth: 1200, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 56, height: 56 }}>
            <Assignment fontSize="large" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
              Tugas & Latihan
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.9)">
              Kerjakan tugas dan latihan soal untuk mengasah pemahaman Anda tentang geometri 3D
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3, mx: 'auto', maxWidth: 1200 }}>
        Soal essay akan dinilai menggunakan AI untuk memberikan feedback yang detail tentang jawaban Anda.
      </Alert>

      {/* Assignment Cards */}
      {assignments.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mx: 'auto', maxWidth: 1200 }}>
          <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Belum Ada Tugas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Belum ada tugas yang tersedia saat ini.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mx: 'auto', maxWidth: 1200 }}>
          <Grid container spacing={3}>
            {assignments.map((assignment) => (
              <Grid item xs={12} md={6} key={assignment.id}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Module/Lesson Badge */}
                    {assignment.module_title && (
                      <Chip
                        label={assignment.module_title}
                        color="primary"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}

                    {/* Title */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {assignment.title}
                    </Typography>

                    {/* Description */}
                    {assignment.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {assignment.description.length > 100
                          ? `${assignment.description.substring(0, 100)}...`
                          : assignment.description}
                      </Typography>
                    )}

                    {/* Stats */}
                    <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                      <Chip
                        icon={<Assignment />}
                        label={`${assignment.question_count} Soal`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<Timer />}
                        label={`${assignment.total_points} Poin`}
                        variant="outlined"
                        size="small"
                      />
                      {assignment.time_limit_minutes && (
                        <Chip
                          icon={<Timer />}
                          label={`${assignment.time_limit_minutes} menit`}
                          variant="outlined"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>

                    {/* Due Date */}
                    {assignment.due_date && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Batas Waktu: {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    )}

                    {/* Attempt Status */}
                    {assignment.has_attempted && assignment.best_score !== undefined && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: 'success.light',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <CheckCircle sx={{ color: 'success.dark' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color="success.dark">
                            Skor Terbaik: {assignment.best_score}/{assignment.total_points}
                          </Typography>
                          {assignment.last_submission && (
                            <Typography variant="caption" color="success.dark">
                              Terakhir: {new Date(assignment.last_submission).toLocaleDateString('id-ID')}
                            </Typography>
                          )}
                          {assignment.attempt_count && assignment.max_attempts && (
                            <Typography variant="caption" color="success.dark" display="block">
                              Percobaan: {assignment.attempt_count}/{assignment.max_attempts}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartAssignment(assignment.id)}
                      size="large"
                      disabled={Boolean(
                        assignment.max_attempts &&
                        assignment.attempt_count &&
                        assignment.attempt_count >= assignment.max_attempts
                      )}
                    >
                      {assignment.max_attempts &&
                       assignment.attempt_count &&
                       assignment.attempt_count >= assignment.max_attempts
                        ? 'Batas Percobaan Tercapai'
                        : assignment.has_attempted
                        ? 'Coba Lagi'
                        : 'Mulai Assignment'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      </Box>
    </>
  )
}