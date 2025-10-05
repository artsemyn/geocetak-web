// src/components/quiz/QuizSection.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Timer,
  EmojiEvents,
  Replay
} from '@mui/icons-material'
import { QuizQuestion } from '../../services/supabase'
import {
  getQuizQuestions,
  saveQuizAttempt,
  getBestQuizAttempt,
  calculateQuizScore
} from '../../services/quizService'
import { supabase } from '../../services/supabase'

interface QuizSectionProps {
  lessonId: string
  onComplete?: (score: number, maxScore: number) => void
}

export const QuizSection: React.FC<QuizSectionProps> = ({ lessonId, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [startTime] = useState(new Date().toISOString())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [bestAttempt, setBestAttempt] = useState<any>(null)
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

  // Fetch quiz questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true)
        const data = await getQuizQuestions(lessonId)
        setQuestions(data)

        // Fetch best attempt if user is logged in
        if (userId) {
          const best = await getBestQuizAttempt(userId, lessonId)
          setBestAttempt(best)
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchQuestions()
    }
  }, [lessonId, userId])

  // Timer
  useEffect(() => {
    if (!submitted && questions.length > 0) {
      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [submitted, questions])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(new Map(answers.set(questionId, value)))
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert('Anda harus login untuk menyimpan hasil quiz')
      return
    }

    const result = calculateQuizScore(questions, answers)
    setScore(result.score)
    setMaxScore(result.maxScore)
    setSubmitted(true)

    try {
      await saveQuizAttempt(userId, {
        lessonId,
        answers: result.quizAnswers,
        score: result.score,
        maxScore: result.maxScore,
        timeSpentSeconds: timeElapsed,
        startedAt: startTime,
        completedAt: new Date().toISOString()
      })

      // Callback untuk update progress
      if (onComplete) {
        onComplete(result.score, result.maxScore)
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
    }
  }

  const handleRetry = () => {
    setAnswers(new Map())
    setSubmitted(false)
    setScore(0)
    setTimeElapsed(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAnswerColor = (questionId: string, optionValue: string) => {
    if (!submitted) return undefined

    const question = questions.find((q) => q.id === questionId)
    const selectedAnswer = answers.get(questionId)

    if (optionValue === question?.correct_answer) {
      return 'success.light'
    }
    if (optionValue === selectedAnswer && optionValue !== question?.correct_answer) {
      return 'error.light'
    }
    return undefined
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Memuat soal quiz...</Typography>
      </Box>
    )
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Belum ada soal quiz untuk lesson ini. Quiz akan segera ditambahkan.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          📝 Quiz Interaktif
        </Typography>
        <Chip
          icon={<Timer />}
          label={formatTime(timeElapsed)}
          color={submitted ? 'default' : 'primary'}
          variant="outlined"
        />
        {bestAttempt && (
          <Chip
            icon={<EmojiEvents />}
            label={`Best: ${bestAttempt.score}/${bestAttempt.max_score}`}
            color="warning"
            size="small"
          />
        )}
      </Stack>

      {/* Result Summary */}
      {submitted && (
        <Card sx={{ mb: 3, bgcolor: score >= maxScore * 0.7 ? 'success.light' : 'warning.light' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <EmojiEvents sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" fontWeight="bold">
                  Skor Anda: {score}/{maxScore}
                </Typography>
                <Typography variant="body1">
                  {score >= maxScore * 0.7
                    ? '🎉 Luar biasa! Anda menguasai materi dengan baik!'
                    : '💪 Terus belajar! Coba lagi untuk meningkatkan skor.'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Waktu pengerjaan: {formatTime(timeElapsed)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Replay />}
                onClick={handleRetry}
                color="primary"
              >
                Coba Lagi
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Stack spacing={3}>
        {questions.map((question, index) => {
          const selectedAnswer = answers.get(question.id)
          const isCorrect = submitted && selectedAnswer === question.correct_answer

          return (
            <Paper key={question.id} elevation={2} sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Chip
                  label={`${index + 1}`}
                  color="primary"
                  sx={{ minWidth: 40, fontWeight: 'bold' }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {question.question_text}
                  </Typography>

                  {question.difficulty && (
                    <Chip
                      label={question.difficulty}
                      size="small"
                      color={
                        question.difficulty === 'easy'
                          ? 'success'
                          : question.difficulty === 'medium'
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ mb: 2 }}
                    />
                  )}

                  <FormControl component="fieldset" fullWidth disabled={submitted}>
                    <RadioGroup
                      value={selectedAnswer || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                      {question.options &&
                        typeof question.options === 'object' &&
                        Object.entries(question.options).map(([key, value]) => (
                          <Paper
                            key={key}
                            variant="outlined"
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: getAnswerColor(question.id, key),
                              border: selectedAnswer === key ? 2 : 1,
                              borderColor:
                                selectedAnswer === key ? 'primary.main' : 'divider'
                            }}
                          >
                            <FormControlLabel
                              value={key}
                              control={<Radio />}
                              label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography>{String(value)}</Typography>
                                  {submitted && key === question.correct_answer && (
                                    <CheckCircle color="success" fontSize="small" />
                                  )}
                                  {submitted &&
                                    key === selectedAnswer &&
                                    key !== question.correct_answer && (
                                      <Cancel color="error" fontSize="small" />
                                    )}
                                </Stack>
                              }
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Paper>
                        ))}
                    </RadioGroup>
                  </FormControl>

                  {/* Explanation */}
                  {submitted && question.explanation && (
                    <Alert
                      severity={isCorrect ? 'success' : 'info'}
                      icon={isCorrect ? <CheckCircle /> : undefined}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        Penjelasan:
                      </Typography>
                      <Typography variant="body2">{question.explanation}</Typography>
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Paper>
          )
        })}
      </Stack>

      {/* Submit Button */}
      {!submitted && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={answers.size !== questions.length}
            sx={{ minWidth: 200 }}
          >
            {answers.size === questions.length
              ? 'Submit Quiz'
              : `Jawab semua soal (${answers.size}/${questions.length})`}
          </Button>
        </Box>
      )}

      {/* Progress Indicator */}
      {!submitted && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {answers.size} dari {questions.length} soal terjawab
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(answers.size / questions.length) * 100}
            sx={{ mt: 1 }}
          />
        </Box>
      )}
    </Box>
  )
}
