import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AccessTime as Clock, EmojiEvents as Trophy, ChevronRight, CheckCircle, Cancel as XCircle, MenuBook as BookOpen } from '@mui/icons-material'
import { supabase, PracticeQuestion, PracticeSession, StudentQuestionAttempt } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLearningStore } from '../stores/learningStore'

interface QuestionAttempt {
  questionId: number
  selectedAnswer: string
  isCorrect: boolean
  timeSpent: number
}

export default function PracticeQuestions() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { modules } = useLearningStore()

  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentModule = modules.find(m => m.id === parseInt(moduleId || '0'))
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const hasAnswered = selectedAnswer !== ''

  useEffect(() => {
    if (moduleId) {
      fetchQuestions()
    }
  }, [moduleId])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('module_id', parseInt(moduleId!))
        .eq('is_active', true)
        .order('difficulty_level', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      setQuestions(data || [])
    } catch (err) {
      setError('Gagal memuat soal latihan')
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    if (!user) return

    try {
      // Get student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (studentError) throw studentError

      // Create practice session
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          student_id: studentData.id,
          module_id: parseInt(moduleId!),
          total_questions: questions.length,
          session_status: 'in_progress'
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      setSessionId(sessionData.id)
      setSessionStarted(true)
      setStartTime(Date.now())
      setQuestionStartTime(Date.now())
    } catch (err) {
      console.error('Error starting session:', err)
      setError('Gagal memulai sesi latihan')
    }
  }

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || !sessionId) return

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    const pointsEarned = isCorrect ? currentQuestion.points : 0

    try {
      // Get student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (studentError) throw studentError

      // Save attempt
      await supabase
        .from('student_question_attempts')
        .insert({
          student_id: studentData.id,
          question_id: currentQuestion.id,
          student_answer: selectedAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_spent: timeSpent,
          attempt_number: 1
        })

      // Update local attempts
      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
        timeSpent
      }
      setAttempts(prev => [...prev, attempt])
      setShowExplanation(true)

    } catch (err) {
      console.error('Error submitting answer:', err)
      setError('Gagal menyimpan jawaban')
    }
  }

  const nextQuestion = () => {
    if (isLastQuestion) {
      finishSession()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
      setShowExplanation(false)
      setQuestionStartTime(Date.now())
    }
  }

  const finishSession = async () => {
    if (!sessionId) return

    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000)
    const correctAnswers = attempts.filter(a => a.isCorrect).length + (selectedAnswer === currentQuestion?.correct_answer ? 1 : 0)
    const totalPoints = attempts.reduce((sum, a) => sum + (a.isCorrect ? currentQuestion?.points || 0 : 0), 0)
    const completionPercentage = (correctAnswers / questions.length) * 100

    try {
      await supabase
        .from('practice_sessions')
        .update({
          correct_answers: correctAnswers,
          total_points: totalPoints,
          time_spent: totalTimeSpent,
          completion_percentage: completionPercentage,
          session_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      // Navigate to results page with session data
      navigate(`/practice-results/${sessionId}`)
    } catch (err) {
      console.error('Error finishing session:', err)
      setError('Gagal menyelesaikan sesi')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal latihan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/modules')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Kembali ke Modul
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Soal Latihan</h2>
          <p className="text-gray-600 mb-4">Soal latihan untuk modul ini belum tersedia.</p>
          <button
            onClick={() => navigate('/modules')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Kembali ke Modul
          </button>
        </div>
      </div>
    )
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Latihan Soal</h1>
              <h2 className="text-xl text-indigo-600 font-semibold">{currentModule?.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-blue-900">{questions.length}</div>
                <div className="text-sm text-blue-700">Total Soal</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-green-900">~{questions.length * 2} menit</div>
                <div className="text-sm text-green-700">Estimasi Waktu</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-purple-900">{questions.reduce((sum, q) => sum + q.points, 0)}</div>
                <div className="text-sm text-purple-700">Total Poin</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startSession}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
              >
                Mulai Latihan
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Soal {currentQuestionIndex + 1} dari {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {currentQuestion?.difficulty_level === 'easy' ? 'Mudah' :
                 currentQuestion?.difficulty_level === 'medium' ? 'Sedang' : 'Sulit'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {currentQuestion?.points} poin
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion?.question_text}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion?.question_type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3 mb-6">
              {JSON.parse(currentQuestion.options).map((option: string, index: number) => (
                <label
                  key={index}
                  className={`
                    block p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedAnswer === option
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${showExplanation
                      ? option === currentQuestion.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === option && option !== currentQuestion.correct_answer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : ''
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => !showExplanation && setSelectedAnswer(e.target.value)}
                    className="sr-only"
                    disabled={showExplanation}
                  />
                  <div className="flex items-center">
                    <div className={`
                      w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center
                      ${selectedAnswer === option
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                      }
                      ${showExplanation && option === currentQuestion.correct_answer
                        ? 'border-green-500 bg-green-500'
                        : ''
                      }
                    `}>
                      {(selectedAnswer === option || (showExplanation && option === currentQuestion.correct_answer)) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900">{option}</span>
                    {showExplanation && option === currentQuestion.correct_answer && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                    )}
                    {showExplanation && selectedAnswer === option && option !== currentQuestion.correct_answer && (
                      <XCircle className="ml-auto h-5 w-5 text-red-500" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && currentQuestion?.explanation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Penjelasan:</h3>
              <p className="text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Keluar
            </button>

            {!showExplanation ? (
              <button
                onClick={submitAnswer}
                disabled={!hasAnswered}
                className={`
                  px-6 py-2 rounded-lg font-semibold transition-colors
                  ${hasAnswered
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Submit Jawaban
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center"
              >
                {isLastQuestion ? 'Selesai' : 'Soal Berikutnya'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}