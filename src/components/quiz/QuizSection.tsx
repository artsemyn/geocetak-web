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
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Timer,
  EmojiEvents,
  Replay,
  AttachFile,
  Delete,
  CloudUpload,
  Description
} from '@mui/icons-material'
import { QuizQuestion } from '../../services/supabase'
import {
  getQuizQuestions,
  saveQuizAttempt,
  getBestQuizAttempt,
  calculateQuizScore
} from '../../services/quizService'
import { supabase } from '../../services/supabase'
import { QuizStorageService, QuizPhotoUploadResult } from '../../services/quizStroageService'

interface QuizSectionProps {
  lessonId: string
  onComplete?: (score: number, maxScore: number) => void
}

interface EssayAnswer {
  text: string
  files: File[]
  uploadedFiles: { url: string; fileName: string; filePath: string }[]
}

export const QuizSection: React.FC<QuizSectionProps> = ({ lessonId, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Map<string, string>>(new Map())
  const [essayAnswers, setEssayAnswers] = useState<Map<string, EssayAnswer>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [startTime] = useState(new Date().toISOString())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [bestAttempt, setBestAttempt] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())

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

        // Initialize essay answers map
        const essayMap = new Map<string, EssayAnswer>()
        data.forEach(q => {
          if (q.question_type === 'essay') {
            essayMap.set(q.id, { text: '', files: [], uploadedFiles: [] })
          }
        })
        setEssayAnswers(essayMap)

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

  const handleEssayTextChange = (questionId: string, text: string) => {
    const current = essayAnswers.get(questionId) || { text: '', files: [], uploadedFiles: [] }
    setEssayAnswers(new Map(essayAnswers.set(questionId, { ...current, text, uploadedFiles: current.uploadedFiles })))
  }

  const handleFileSelect = async (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !userId) return

    const current = essayAnswers.get(questionId) || { text: '', files: [], uploadedFiles: [] }
    const newFiles = Array.from(files)
    
    // Validate files using QuizStorageService
    const validFiles: File[] = []
    for (const file of newFiles) {
      const validation = QuizStorageService.validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        alert(validation.error)
      }
    }

    if (validFiles.length === 0) return

    // Set uploading state
    setUploadingFiles(prev => new Set([...prev, questionId]))

    try {
      // Upload files immediately
      const uploadResults = await Promise.all(
        validFiles.map(file => QuizStorageService.uploadQuizPhoto(file, userId, questionId))
      )

      const successfulUploads = uploadResults.filter(result => result.success)
      const failedUploads = uploadResults.filter(result => !result.success)

      if (failedUploads.length > 0) {
        alert(`Gagal mengupload ${failedUploads.length} file: ${failedUploads.map(f => f.error).join(', ')}`)
      }

      // Update state with uploaded files
      setEssayAnswers(new Map(essayAnswers.set(questionId, {
        ...current,
        uploadedFiles: [
          ...current.uploadedFiles,
          ...successfulUploads.map(result => ({
            url: result.url!,
            fileName: result.fileName!,
            filePath: result.filePath!
          }))
        ]
      })))
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Terjadi kesalahan saat mengupload file')
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  const handleRemoveFile = (questionId: string, fileIndex: number) => {
    const current = essayAnswers.get(questionId)
    if (!current) return

    const newFiles = current.files.filter((_, index) => index !== fileIndex)
    setEssayAnswers(new Map(essayAnswers.set(questionId, {
      ...current,
      files: newFiles
    })))
  }

  const handleSubmit = async () => {
    if (!userId) {
      alert('Anda harus login untuk menyimpan hasil quiz')
      return
    }

    setLoading(true)

    try {
      // Prepare essay answers with already uploaded files
      const essayAnswersWithUrls = new Map<string, any>()
      
      for (const [questionId, essayAnswer] of essayAnswers.entries()) {
        // Use already uploaded files URLs
        const fileUrls = essayAnswer.uploadedFiles?.map(file => file.url) || []
        
        essayAnswersWithUrls.set(questionId, {
          text: essayAnswer.text,
          fileUrls,
          uploadedFiles: essayAnswer.uploadedFiles || []
        })
      }

      // Calculate score for multiple choice
      const mcQuestions = questions.filter(q => q.question_type === 'multiple_choice' || !q.question_type)
      const result = calculateQuizScore(mcQuestions, answers)
      
      // Add essay answers to the result
      const allAnswers = {
        ...result.quizAnswers,
        essays: Object.fromEntries(essayAnswersWithUrls)
      }

      setScore(result.score)
      setMaxScore(result.maxScore)
      setSubmitted(true)

      await saveQuizAttempt(userId, {
        lessonId,
        answers: allAnswers,
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
      alert('Terjadi kesalahan saat menyimpan jawaban. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setAnswers(new Map())
    const essayMap = new Map<string, EssayAnswer>()
    questions.forEach(q => {
      if (q.question_type === 'essay') {
        essayMap.set(q.id, { text: '', files: [] })
      }
    })
    setEssayAnswers(essayMap)
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

  const isAllQuestionsAnswered = () => {
    const mcCount = questions.filter(q => q.question_type === 'multiple_choice' || !q.question_type).length
    const essayCount = questions.filter(q => q.question_type === 'essay').length
    
    const mcAnswered = answers.size >= mcCount
    const essayAnswered = Array.from(essayAnswers.values()).filter(
      ans => ans.text.trim().length > 0 || (ans.uploadedFiles && ans.uploadedFiles.length > 0)
    ).length >= essayCount

    return mcAnswered && essayAnswered
  }

  if (loading && questions.length === 0) {
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
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    ℹ️ Jawaban essay Anda telah tersimpan dan akan dinilai oleh guru.
                  </Typography>
                </Alert>
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
          const essayAnswer = essayAnswers.get(question.id)
          const isCorrect = submitted && (
            question.question_type === 'essay'
              ? question.acceptable_answers?.some(acceptable =>
                  acceptable.toLowerCase().replace(/[^a-z0-9.,]/g, '') ===
                  (essayAnswer?.text || '').toLowerCase().replace(/[^a-z0-9.,]/g, '')
                )
              : selectedAnswer === question.correct_answer
          )

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

                  {/* Multiple Choice Questions */}
                  {question.question_type === 'multiple_choice' || !question.question_type ? (
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
                  ) : (
                    /* Essay Questions */
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Tuliskan jawaban Anda di sini..."
                        value={essayAnswer?.text || ''}
                        onChange={(e) => handleEssayTextChange(question.id, e.target.value)}
                        disabled={submitted}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: submitted
                              ? (question.acceptable_answers?.some(acceptable =>
                                  acceptable.toLowerCase().replace(/[^a-z0-9.,]/g, '') ===
                                  (essayAnswer?.text || '').toLowerCase().replace(/[^a-z0-9.,]/g, '')
                                ) ? 'success.light' : 'error.light')
                              : 'background.paper'
                          }
                        }}
                      />
                      
                      {/* File Upload */}
                      {!submitted && (
                        <Box sx={{ mt: 2 }}>
                          <input
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            id={`file-upload-${question.id}`}
                            type="file"
                            multiple
                            onChange={(e) => handleFileSelect(question.id, e)}
                          />
                          <label htmlFor={`file-upload-${question.id}`}>
                            <Button
                              variant="outlined"
                              component="span"
                              startIcon={<AttachFile />}
                              size="small"
                            >
                              Lampirkan File
                            </Button>
                          </label>
                        </Box>
                      )}

                      {/* File List */}
                      {essayAnswer && essayAnswer.files.length > 0 && (
                        <List dense sx={{ mt: 1 }}>
                          {essayAnswer.files.map((file, index) => (
                            <ListItem key={index}>
                              <Description sx={{ mr: 1 }} />
                              <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                              {!submitted && (
                                <ListItemSecondaryAction>
                                  <IconButton
                                    edge="end"
                                    onClick={() => handleRemoveFile(question.id, index)}
                                    size="small"
                                  >
                                    <Delete />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      )}

                      {/* Essay Result */}
                      {submitted && (
                        <Box sx={{ mt: 1 }}>
                          {question.acceptable_answers?.some(acceptable =>
                            acceptable.toLowerCase().replace(/[^a-z0-9.,]/g, '') ===
                            (essayAnswer?.text || '').toLowerCase().replace(/[^a-z0-9.,]/g, '')
                          ) ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CheckCircle color="success" fontSize="small" />
                              <Typography variant="body2" color="success.main">
                                Jawaban Benar!
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Cancel color="error" fontSize="small" />
                              <Typography variant="body2" color="error.main">
                                Jawaban akan dinilai oleh guru
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

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
            disabled={!isAllQuestionsAnswered() || loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? 'Menyimpan...' : isAllQuestionsAnswered()
              ? 'Submit Quiz'
              : `Jawab semua soal (${answers.size + Array.from(essayAnswers.values()).filter(ans => ans.text.trim().length > 0).length}/${questions.length})`}
          </Button>
        </Box>
      )}

      {/* Progress Indicator */}
      {!submitted && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {answers.size + Array.from(essayAnswers.values()).filter(ans => ans.text.trim().length > 0).length} dari {questions.length} soal terjawab
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((answers.size + Array.from(essayAnswers.values()).filter(ans => ans.text.trim().length > 0).length) / questions.length) * 100}
            sx={{ mt: 1 }}
          />
        </Box>
      )}
    </Box>
  )
}