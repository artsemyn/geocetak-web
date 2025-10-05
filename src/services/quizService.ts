// src/services/quizService.ts
import { supabase, QuizQuestion, QuizAttempt } from './supabase'

export interface QuizAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
}

export interface QuizSubmission {
  lessonId: string
  answers: QuizAnswer[]
  score: number
  maxScore: number
  timeSpentSeconds: number
  startedAt: string
  completedAt: string
}

/**
 * Fetch quiz questions for a specific lesson
 */
export async function getQuizQuestions(lessonId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching quiz questions:', error)
    throw error
  }

  return data || []
}

/**
 * Save quiz attempt to database
 */
export async function saveQuizAttempt(
  userId: string,
  submission: QuizSubmission
): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      lesson_id: submission.lessonId,
      answers: submission.answers,
      score: submission.score,
      max_score: submission.maxScore,
      time_spent_seconds: submission.timeSpentSeconds,
      started_at: submission.startedAt,
      completed_at: submission.completedAt
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving quiz attempt:', error)
    throw error
  }

  return data
}

/**
 * Get quiz attempt history for a user and lesson
 */
export async function getQuizHistory(
  userId: string,
  lessonId: string
): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quiz history:', error)
    throw error
  }

  return data || []
}

/**
 * Get best quiz attempt for a user and lesson
 */
export async function getBestQuizAttempt(
  userId: string,
  lessonId: string
): Promise<QuizAttempt | null> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching best quiz attempt:', error)
    throw error
  }

  return data || null
}

/**
 * Calculate quiz score from answers
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: Map<string, string>
): { score: number; maxScore: number; quizAnswers: QuizAnswer[] } {
  let score = 0
  const maxScore = questions.reduce((sum, q) => sum + (q.points || 1), 0)
  const quizAnswers: QuizAnswer[] = []

  questions.forEach((question) => {
    const selectedAnswer = answers.get(question.id)
    const isCorrect = selectedAnswer === question.correct_answer

    if (isCorrect) {
      score += question.points || 1
    }

    quizAnswers.push({
      questionId: question.id,
      selectedAnswer: selectedAnswer || '',
      isCorrect
    })
  })

  return { score, maxScore, quizAnswers }
}
