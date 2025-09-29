// src/services/aiAssessmentService.ts - CORRECTED for Integer IDs
import { supabase } from './supabase'

export interface EvaluationRequest {
  problemText: string
  studentAnswer: string
  lessonId: string | number  // Can handle both string and number
  rubricId?: string | number
  geometryType: 'cylinder' | 'cone' | 'sphere'
}

export interface AIFeedback {
  overallScore: number
  criteriaScores: {
    mathematical_accuracy: number
    conceptual_understanding: number
    problem_solving_approach: number
    communication: number
    geometric_relationships?: number
    real_world_application?: number
    archimedes_understanding?: number
    symmetry_properties?: number
    [key: string]: number | undefined
  }
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  nextSteps: string[]
}

export interface ChainOfThoughtStep {
  step: number
  reasoning: string
  finding: string
  confidence: number
}

export interface AIAssessment {
  id: number  // Changed from string to number
  user_id: string
  lesson_id: number  // Changed from string to number
  rubric_id?: number  // Changed from string to number
  problem_text: string
  student_answer: string
  ai_score?: number
  ai_feedback?: AIFeedback
  reasoning_steps?: ChainOfThoughtStep[]
  teacher_review: boolean
  teacher_override_score?: number
  teacher_comments?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processing_time_ms?: number
  created_at: string
  updated_at: string
}

export interface AssessmentRubric {
  id: number
  lesson_id: number
  title: string
  criteria: any
  max_score: number
  created_at: string
}

export interface EvaluationResponse {
  assessmentId: number  // Changed from string to number
  feedback: AIFeedback
  reasoning: ChainOfThoughtStep[]
  processingTimeMs: number
}

class AIAssessmentService {
  async submitForEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Ensure lessonId is a number for API call
    const normalizedRequest = {
      ...request,
      lessonId: typeof request.lessonId === 'string' ? parseInt(request.lessonId) : request.lessonId
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('evaluate-essay', {
      body: normalizedRequest,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    if (error) {
      console.error('AI evaluation error:', error)
      throw new Error(`AI evaluation failed: ${error.message}`)
    }

    return data as EvaluationResponse
  }

  async getAssessmentHistory(lessonId?: string | number): Promise<AIAssessment[]> {
    let query = supabase
      .from('ai_assessments')
      .select(`
        *,
        lessons:lesson_id (title),
        assessment_rubrics:rubric_id (title)
      `)
      .order('created_at', { ascending: false })

    if (lessonId) {
      const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId
      query = query.eq('lesson_id', numericLessonId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assessment history:', error)
      throw new Error('Failed to fetch assessment history')
    }

    return data || []
  }

  async getAssessmentById(id: string | number): Promise<AIAssessment | null> {
    const numericId = typeof id === 'string' ? parseInt(id) : id
    
    const { data, error } = await supabase
      .from('ai_assessments')
      .select(`
        *,
        lessons:lesson_id (title),
        assessment_rubrics:rubric_id (title)
      `)
      .eq('id', numericId)
      .single()

    if (error) {
      console.error('Error fetching assessment:', error)
      return null
    }

    return data
  }

  async getRubrics(lessonId?: string | number): Promise<AssessmentRubric[]> {
    let query = supabase
      .from('assessment_rubrics')
      .select('*')
      .order('title')

    if (lessonId) {
      const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId
      query = query.eq('lesson_id', numericLessonId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching rubrics:', error)
      return []
    }

    return data || []
  }

  async getRubricForLesson(lessonId: string | number): Promise<AssessmentRubric | null> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId
    
    const { data, error } = await supabase
      .from('assessment_rubrics')
      .select('*')
      .eq('lesson_id', numericLessonId)
      .single()

    if (error) {
      console.error('Error fetching rubric for lesson:', error)
      return null
    }

    return data
  }

  // Real-time subscription for assessment status updates
  subscribeToAssessmentUpdates(
    assessmentId: string | number, 
    callback: (assessment: AIAssessment) => void
  ) {
    const numericId = typeof assessmentId === 'string' ? parseInt(assessmentId) : assessmentId
    
    return supabase
      .channel(`assessment_${numericId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_assessments',
          filter: `id=eq.${numericId}`
        },
        (payload) => {
          callback(payload.new as AIAssessment)
        }
      )
      .subscribe()
  }

  // Get assessment statistics for a lesson
  async getLessonAssessmentStats(lessonId: string | number): Promise<{
    totalSubmissions: number
    averageScore: number
    lastSubmission?: Date
    completionRate: number
  }> {
    const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId) : lessonId
    
    const { data, error } = await supabase
      .from('ai_assessments')
      .select('ai_score, status, created_at')
      .eq('lesson_id', numericLessonId)

    if (error) {
      console.error('Error fetching lesson stats:', error)
      return {
        totalSubmissions: 0,
        averageScore: 0,
        completionRate: 0
      }
    }

    const assessments = data || []
    const completedAssessments = assessments.filter(a => a.status === 'completed' && a.ai_score)
    
    const averageScore = completedAssessments.length > 0
      ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.ai_score || 0), 0) / completedAssessments.length)
      : 0

    const lastSubmission = assessments.length > 0
      ? new Date(Math.max(...assessments.map(a => new Date(a.created_at).getTime())))
      : undefined

    return {
      totalSubmissions: assessments.length,
      averageScore,
      lastSubmission,
      completionRate: assessments.length > 0 ? (completedAssessments.length / assessments.length) * 100 : 0
    }
  }

  // Generate practice problems based on current lesson
  async generatePracticeProblems(
    geometryType: 'cylinder' | 'cone' | 'sphere',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 3
  ): Promise<string[]> {
    const templates = this.getProblemTemplates(geometryType, difficulty)
    
    // For now, return static problems. In production, you might want to
    // use AI to generate varied problems or maintain a larger database
    return templates.slice(0, count)
  }

  private getProblemTemplates(
    geometryType: string, 
    difficulty: string
  ): string[] {
    const templates = {
      cylinder: {
        easy: [
          "Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Hitunglah luas permukaan dan volume tabung tersebut!",
          "Pak Budi membuat tangki air berbentuk tabung dengan diameter 14 cm dan tinggi 20 cm. Berapa liter air yang dapat ditampung tangki tersebut?",
          "Sebuah kaleng berbentuk tabung memiliki jari-jari alas 5 cm dan tinggi 12 cm. Berapa cm² luas permukaan kaleng tersebut?"
        ],
        medium: [
          "Sebuah pabrik memproduksi drum minyak berbentuk tabung. Jika volume drum adalah 200π cm³ dan tingginya 8 cm, tentukan jari-jari alas drum dan luas permukaan seluruhnya!",
          "Seorang arsitek merancang kolom berbentuk tabung untuk gedung. Jika luas permukaan kolom adalah 628 cm² dan tingginya sama dengan diameter, tentukan dimensi kolom tersebut!",
          "Andi memiliki dua tabung dengan jari-jari yang sama. Tabung pertama tingginya 10 cm dengan volume 314 cm³. Jika tabung kedua volumenya 2 kali tabung pertama, berapa tinggi tabung kedua?"
        ],
        hard: [
          "Sebuah tangki berbentuk tabung horizontal diisi air hingga separuh tingginya. Jika jari-jari tangki 1 m dan panjangnya 3 m, hitunglah volume air dalam tangki dan luas permukaan yang terkena air!",
          "Perusahaan farmasi membuat kapsul obat berbentuk tabung dengan kedua ujung setengah bola. Jika panjang total kapsul 2 cm dan diameter 0.5 cm, hitunglah volume dan luas permukaan kapsul!",
          "Seorang insinyur merancang sistem pipa dengan 3 tabung konsentrik (nested). Jari-jari tabung dari dalam ke luar adalah 2 cm, 3 cm, dan 4 cm dengan tinggi sama 10 cm. Hitunglah volume material yang digunakan!"
        ]
      },
      cone: {
        easy: [
          "Sebuah kerucut memiliki jari-jari alas 6 cm dan tinggi 8 cm. Hitunglah garis pelukis, luas permukaan, dan volume kerucut tersebut!",
          "Topi ulang tahun berbentuk kerucut memiliki diameter alas 14 cm dan tinggi 12 cm. Berapa cm² kertas yang dibutuhkan untuk membuat topi tersebut?",
          "Sebuah corong berbentuk kerucut memiliki jari-jari 5 cm dan garis pelukis 13 cm. Tentukan tinggi dan volume corong tersebut!"
        ],
        medium: [
          "Traffic cone di jalan raya memiliki volume 1.047 cm³ dan tinggi 30 cm. Jika cone tersebut akan dicat, berapa cm² luas permukaan yang harus dicat?",
          "Sebuah kerucut dan tabung memiliki alas dan tinggi yang sama. Jika volume tabung adalah 942 cm³, berapa volume kerucutnya? Jelaskan hubungan matematisnya!",
          "Atap rumah Honai berbentuk kerucut dengan diameter 8 m dan garis pelukis 5 m. Berapa m² jerami yang dibutuhkan untuk menutupi atap tersebut?"
        ],
        hard: [
          "Sebuah tangki air berbentuk kerucut terbalik (vertex di bawah) diisi air hingga kedalaman 4 m. Jika jari-jari tangki bagian atas 6 m dan tinggi total 9 m, hitunglah volume air dan luas permukaan air yang terbuka!",
          "Perusahaan es krim membuat cone dengan tinggi 12 cm dan volume 100 cm³. Jika mereka ingin membuat cone baru dengan volume 2 kali lipat dengan tinggi yang sama, berapa perubahan jari-jari yang diperlukan?",
          "Seorang seniman membuat patung berbentuk kerucut berlapis. Kerucut luar memiliki jari-jari 10 cm dan tinggi 15 cm, sementara kerucut dalam (yang berlubang) memiliki jari-jari 6 cm dan tinggi 9 cm. Hitunglah volume material patung!"
        ]
      },
      sphere: {
        easy: [
          "Sebuah bola memiliki jari-jari 7 cm. Hitunglah luas permukaan dan volume bola tersebut!",
          "Bola sepak memiliki diameter 22 cm. Berapa cm³ volume udara di dalam bola tersebut?",
          "Sebuah kubah masjid berbentuk setengah bola dengan jari-jari 10 m. Berapa m² luas permukaan kubah yang perlu dicat?"
        ],
        medium: [
          "Sebuah tangki air berbentuk bola memiliki volume 36π m³. Berapa meter jari-jari tangki tersebut dan berapa luas permukaannya?",
          "Archimedes menemukan bahwa volume bola sama dengan 2/3 volume tabung yang melingkupinya. Jika sebuah bola memiliki jari-jari 6 cm, berapa volume tabung yang melingkupinya?",
          "Sebuah perusahaan memproduksi bola pingpong dengan diameter 4 cm. Jika mereka menggunakan plastik seharga Rp 500 per cm², berapa biaya bahan untuk membuat satu bola?"
        ],
        hard: [
          "Sebuah planetarium memiliki kubah berbentuk setengah bola dengan luas permukaan dalam 314 m². Jika akan dipasang proyektor di tengah-tengah tinggi kubah, berapa jarak proyektor ke dinding kubah terjauh?",
          "Sebuah balon udara berbentuk bola mengembang dari jari-jari 1 m menjadi 2 m. Berapa kali lipat pertambahan volume dan luas permukaannya?",
          "Seorang insinyur merancang bearing (bantalan bola) dengan bola-bola kecil diameter 8 mm di dalam cincin. Jika cincin dapat memuat 12 bola dan setiap bola menyentuh cincin serta 2 bola di sampingnya, hitunglah diameter dalam cincin!"
        ]
      }
    }

    return templates[geometryType as keyof typeof templates]?.[difficulty as keyof typeof templates.cylinder] || []
  }
}

export const aiAssessmentService = new AIAssessmentService()