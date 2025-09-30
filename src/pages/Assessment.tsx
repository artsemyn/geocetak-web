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

interface LessonWithQuestions {
  lesson_id: number
  lesson_title: string
  module_title: string
  question_count: number
  total_points: number
  essay_count: number
  has_attempted: boolean
  best_score?: number
  last_attempt?: string
}

interface Question {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'essay'
  options?: string[]
  correct_answer?: string
  explanation?: string
  difficulty: string
  points: number
  order_index: number
}

interface Answer {
  questionId: string
  answer: string
  isCorrect?: boolean
  aiScore?: number
  timeSpent: number
}

export default function Assessment() {
  const { user } = useAuthStore()

  // List View States
  const [assessments, setAssessments] = useState<LessonWithQuestions[]>([])
  const [loadingList, setLoadingList] = useState(true)

  // Assessment View States
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
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

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Fetch assessment list on mount
  useEffect(() => {
    if (user && !selectedLesson) {
      fetchAssessments()
    }
  }, [user, selectedLesson])

  const fetchAssessments = async () => {
    try {
      setLoadingList(true)

      // Fetch lessons that have quiz questions (essay type)
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('lesson_id, question_type, points, lessons(id, title, modules(title))')
        .eq('question_type', 'essay')

      if (questionsError) throw questionsError

      // Group by lesson and count
      const lessonMap = new Map<number, LessonWithQuestions>()

      questionsData?.forEach((q: any) => {
        const lessonId = q.lesson_id
        if (!lessonMap.has(lessonId)) {
          lessonMap.set(lessonId, {
            lesson_id: lessonId,
            lesson_title: q.lessons?.title || 'Unknown Lesson',
            module_title: q.lessons?.modules?.title || 'Unknown Module',
            question_count: 0,
            total_points: 0,
            essay_count: 0,
            has_attempted: false
          })
        }

        const lesson = lessonMap.get(lessonId)!
        lesson.question_count++
        lesson.total_points += q.points || 0
        if (q.question_type === 'essay') {
          lesson.essay_count++
        }
      })

      // Fetch user's quiz attempts
      if (user) {
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('lesson_id, score, max_score, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })

        // Update with attempt data
        attemptsData?.forEach((attempt: any) => {
          const lesson = lessonMap.get(attempt.lesson_id)
          if (lesson) {
            lesson.has_attempted = true
            if (!lesson.best_score || attempt.score > lesson.best_score) {
              lesson.best_score = attempt.score
            }
            if (!lesson.last_attempt || attempt.completed_at > lesson.last_attempt) {
              lesson.last_attempt = attempt.completed_at
            }
          }
        })
      }

      const assessmentsList = Array.from(lessonMap.values())
      setAssessments(assessmentsList)

    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoadingList(false)
    }
  }

  const handleStartAssessment = async (lessonId: number) => {
    setSelectedLesson(lessonId)
    setLoadingQuestions(true)

    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index')

      if (error) throw error

      // Parse options for multiple choice questions
      const parsedQuestions = data?.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : undefined
      })) || []

      setQuestions(parsedQuestions)
      setSessionStartTime(Date.now())
      setQuestionStartTime(Date.now())
      setCurrentQuestionIndex(0)
      setAnswers([])
      setCurrentAnswer('')
      setShowResults(false)

    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Gagal memuat soal assessment')
      setSelectedLesson(null)
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
      await handleSubmitAssessment([...answers, newAnswer])
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

  const handleSubmitAssessment = async (finalAnswers: Answer[]) => {
    if (!user) return

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
        return acc + (answer.isCorrect ? question?.points || 0 : 0)
      }, 0)

      const maxMCScore = mcQuestions.reduce((acc, q) => acc + q.points, 0)

      // For essay questions, submit to AI for evaluation
      const essayAnswers = finalAnswers.filter(a => {
        const q = questions.find(qu => qu.id === a.questionId)
        return q?.question_type === 'essay'
      })

      let essayScoresTotal = 0
      const maxEssayScore = essayQuestions.reduce((acc, q) => acc + q.points, 0)

      for (const answer of essayAnswers) {
        const question = questions.find(q => q.id === answer.questionId)
        if (question) {
          try {
            const evaluation = await aiAssessmentService.submitForEvaluation({
              problemText: question.question_text,
              studentAnswer: answer.answer,
              lessonId: selectedLesson!.toString(),
              geometryType: 'cylinder' // This should be dynamic based on lesson
            })

            // Convert AI score (0-100) to question points
            const questionScore = (evaluation.feedback.overallScore / 100) * question.points
            essayScoresTotal += questionScore

            // Update answer with AI score
            answer.aiScore = evaluation.feedback.overallScore
          } catch (error) {
            console.error('Error evaluating essay:', error)
          }
        }
      }

      const totalScore = mcScore + essayScoresTotal
      const maxScore = maxMCScore + maxEssayScore
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

      // Save quiz attempt
      const totalTimeSpent = Math.floor((Date.now() - sessionStartTime) / 1000)

      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        lesson_id: selectedLesson,
        answers: finalAnswers,
        score: Math.round(totalScore),
        max_score: maxScore,
        time_spent_seconds: totalTimeSpent
      })

      // Update student progress
      await supabase.from('student_progress').upsert({
        user_id: user.id,
        lesson_id: selectedLesson,
        status: percentage >= 60 ? 'completed' : 'in_progress',
        completion_percentage: Math.round(percentage),
        quiz_score: Math.round(totalScore)
      })

      setShowResults(true)

    } catch (error) {
      console.error('Error submitting assessment:', error)
      alert('Gagal menyimpan hasil assessment. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToList = () => {
    setSelectedLesson(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentAnswer('')
    setShowResults(false)
    fetchAssessments()
  }

  const handleRetry = () => {
    if (selectedLesson) {
      handleStartAssessment(selectedLesson)
    }
  }

  // RENDER: Loading List
  if (loadingList && !selectedLesson) {
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
  if (showResults && selectedLesson) {
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

    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            {percentage >= 60 ? (
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            )}

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {percentage >= 60 ? 'Selamat!' : 'Tetap Semangat!'}
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Skor Anda: {Math.round(totalScore)}/{maxScore} ({percentage.toFixed(0)}%)
            </Typography>
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

  // RENDER: Assessment Form View
  if (selectedLesson && questions.length > 0) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Progress Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Assessment - Soal {currentQuestionIndex + 1} dari {questions.length}
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <Timer />
              <Typography variant="body2">
                {Math.floor((Date.now() - sessionStartTime) / 60000)} menit
              </Typography>
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
          <DialogTitle>Keluar dari Assessment?</DialogTitle>
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

  // RENDER: Assessment List (Default View)
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
              Latihan Soal Essay
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.9)">
              Kerjakan soal-soal essay untuk mengasah pemahaman Anda tentang geometri 3D
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3, mx: 'auto', maxWidth: 1200 }}>
        Soal essay akan dinilai menggunakan AI untuk memberikan feedback yang detail tentang jawaban Anda.
      </Alert>

      {/* Assessment Cards */}
      {assessments.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mx: 'auto', maxWidth: 1200 }}>
          <Assignment sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Belum Ada Latihan Soal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Belum ada soal essay yang tersedia saat ini.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mx: 'auto', maxWidth: 1200 }}>
          <Grid container spacing={3}>
            {assessments.map((assessment) => (
              <Grid item xs={12} md={6} key={assessment.lesson_id}>
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
                    {/* Module Badge */}
                    <Chip
                      label={assessment.module_title}
                      color="primary"
                      size="small"
                      sx={{ mb: 2 }}
                    />

                    {/* Title */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {assessment.lesson_title}
                    </Typography>

                    {/* Stats */}
                    <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                      <Chip
                        icon={<Assignment />}
                        label={`${assessment.essay_count} Soal Essay`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        icon={<Timer />}
                        label={`${assessment.total_points} Poin`}
                        variant="outlined"
                        size="small"
                      />
                    </Box>

                    {/* Attempt Status */}
                    {assessment.has_attempted && assessment.best_score !== undefined && (
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
                            Skor Terbaik: {assessment.best_score}/{assessment.total_points}
                          </Typography>
                          {assessment.last_attempt && (
                            <Typography variant="caption" color="success.dark">
                              Terakhir: {new Date(assessment.last_attempt).toLocaleDateString('id-ID')}
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
                      onClick={() => handleStartAssessment(assessment.lesson_id)}
                      size="large"
                    >
                      {assessment.has_attempted ? 'Coba Lagi' : 'Mulai Assessment'}
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