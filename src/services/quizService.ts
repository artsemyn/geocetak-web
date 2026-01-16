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

  if (error) {
    console.error('Error fetching best quiz attempt:', error)
    return null
  }

  // Return first item or null if array is empty
  return data && data.length > 0 ? data[0] : null
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

/**
 * Fetch quiz questions for a specific module (ID or Slug)
 * This is robust: it handles both UUIDs and Slugs (e.g. 'tabung')
 * It finds any questions linked to the module, regardless of lesson type
 */
export async function getQuizQuestionsByModule(moduleIdOrSlug: string): Promise<QuizQuestion[]> {
  console.log(`[QuizService] Fetching questions for module ID/Slug: ${moduleIdOrSlug}`)

  let targetModuleId = moduleIdOrSlug

  // Helper: map common slugs to known IDs directly to avoid lookup failure
  const knownModules: Record<string, string> = {
    'tabung': '4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd',
    'kerucut': '30e22668-7150-4e07-8c43-a4e9468c3e2f',
    'bola': 'a5e50615-afaf-492b-ba89-7a1b09e4b03a'
  }

  // Check if it's a known slug
  if (knownModules[moduleIdOrSlug.toLowerCase()]) {
    targetModuleId = knownModules[moduleIdOrSlug.toLowerCase()]
    console.log(`[QuizService] Mapped slug '${moduleIdOrSlug}' to known ID: ${targetModuleId}`)
  } else {
    // Check if input is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleIdOrSlug)

    if (!isUuid) {
      console.log(`[QuizService] Input '${moduleIdOrSlug}' is not a UUID, assuming slug. Looking up real ID...`)
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('slug', moduleIdOrSlug)
        .single()

      if (!moduleError && moduleData) {
        targetModuleId = moduleData.id
        console.log(`[QuizService] Resolved slug '${moduleIdOrSlug}' to ID: ${targetModuleId}`)
      } else {
        console.error('[QuizService] Could not find module by slug:', moduleIdOrSlug, moduleError)
        // If we can't find the module ID, we can't really fetch from DB, so we might need fallback questions directly.
        // For now, let's try to proceed with targetModuleId as is, but it will likely fail DB lookup.
      }
    }
  }

  try {
    // First get all lessons for this module to find their IDs
    const { data: lessons, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title, lesson_type')
      .eq('module_id', targetModuleId)

    // Helper: Validates if we have valid lesson IDs
    let lessonIds: string[] = []

    if (!lessonError && lessons && lessons.length > 0) {
      lessonIds = lessons.map(l => l.id)
      console.log(`[QuizService] Found ${lessonIds.length} lessons in module:`, lessons)
    }

    // Attempt to fetch from DB if we have lesson IDs
    if (lessonIds.length > 0) {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .in('lesson_id', lessonIds)
        .order('order_index', { ascending: true })

      if (!error && data && data.length > 0) {
        console.log(`[QuizService] Successfully fetched ${data.length} questions for module ${targetModuleId}`)
        return data
      }
    }
  } catch (err) {
    console.warn('[QuizService] Error fetching from DB, trying fallback:', err)
  }

  console.warn('[QuizService] Falling back to hardcoded questions for module:', targetModuleId)

  // Fallback Questions if DB fails or returns empty
  return getFallbackQuestions(targetModuleId)
}

// Helper to get fallback questions
function getFallbackQuestions(moduleId: string): QuizQuestion[] {
  // Full dataset provided by user
  const allQuestions = [
    { "idx": 0, "id": "0452280e-4b90-482c-b47c-4d154441f2b4", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Tentukan volume sebuah bola voli jika diameternya 14 cm. Gunakan π = 22/7.", "question_type": "essay", "options": null, "correct_answer": "r = 14/2 = 7 cm. V = (4/3)πr³ = (4/3) × (22/7) × 7³ = (4/3) × (22/7) × 343 = (4/3) × 1.078 = 1.437,33 cm³", "explanation": "Volume bola = (4/3)πr³, dimana r adalah jari-jari bola", "difficulty": "medium", "points": 20, "order_index": 5, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 1, "id": "0f649c6b-3cb0-4981-9d41-3963266eb0a5", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Sebuah payung taman memiliki bentuk kerucut. Payung tersebut memiliki tinggi 1,5 meter, panjang garis pelukis 4 meter dan jari-jari alas 3 meter. Hitunglah luas permukaan payung tersebut.", "question_type": "essay", "options": null, "correct_answer": "L = πr(r + s) = 3,14 × 3 × (3 + 4) = 3,14 × 3 × 7 = 65,94 m²", "explanation": "Luas permukaan kerucut = πr(r + s), dimana r = jari-jari alas dan s = garis pelukis", "difficulty": "medium", "points": 20, "order_index": 5, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 2, "id": "1e4e3e0a-d536-4f5c-997e-e88ba6395317", "lesson_id": "76c278f6-23d7-4b73-8ef2-73943ccb4af9", "question_text": "Mengapa bola tidak memiliki jaring-jaring?", "question_type": "multiple_choice", "options": { "a": "Permukaannya melengkung sempurna", "b": "Terlalu besar", "c": "Tidak memiliki sisi", "d": "Terlalu kecil" }, "correct_answer": "a", "explanation": "Permukaan bola melengkung di semua arah sehingga tidak dapat dibentangkan menjadi bidang datar tanpa merobek atau meregangkan", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 3, "id": "2012839c-82ac-4452-93fe-ac9c1159196d", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Sebuah kerucut memiliki garis pelukis 25 m dan diameter 14 m. Hitunglah volumenya! (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "1.020,6 m³", "b": "1.278,7 m³", "c": "1.537,5 m³", "d": "1.627,4 m³" }, "correct_answer": "b", "explanation": "r = 14/2 = 7 m. t = √(s² - r²) = √(625 - 49) = √576 = 24 m. V = (1/3)πr²t = (1/3) × 3,14 × 49 × 24 ≈ 1.278,7 m³", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 4, "id": "21fa1e17-b3e9-403f-9042-4611de6ba44a", "lesson_id": "92f9be24-eb1b-4e9a-a4db-9f1d77d83dbe", "question_text": "Berapa banyak sisi pada jaring-jaring tabung?", "question_type": "multiple_choice", "options": { "a": "3", "b": "2", "c": "4", "d": "5" }, "correct_answer": "a", "explanation": "Jaring-jaring tabung terdiri dari 2 lingkaran (alas dan tutup) dan 1 persegi panjang (selimut)", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 5, "id": "2240ab49-301b-4cd9-8434-f9912307d336", "lesson_id": "d490346b-96a3-4b74-9473-61b5b38b0924", "question_text": "Apa rumus volume kerucut?", "question_type": "multiple_choice", "options": { "a": "⅓πr²h", "b": "πr²h", "c": "⅔πr²h", "d": "½πr²h" }, "correct_answer": "a", "explanation": "Volume kerucut adalah sepertiga dari volume tabung dengan alas dan tinggi yang sama", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 6, "id": "257fddbe-d44c-4ea3-92e6-23a3a9a7fad2", "lesson_id": "ec43f654-5eaf-4494-abc7-6b47d0158994", "question_text": "Apa rumus volume tabung?", "question_type": "multiple_choice", "options": { "a": "πr²h", "b": "πrh", "c": "2πr", "d": "πr²" }, "correct_answer": "a", "explanation": "Volume tabung dihitung dengan luas alas (πr²) dikali tinggi (h)", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 7, "id": "259f0d68-f059-4c68-bcff-cb325196a3f3", "lesson_id": "dcd96a9a-8735-4d1d-b0fa-906b0ec4c685", "question_text": "Bentuk selimut kerucut pada jaring-jaring adalah...", "question_type": "multiple_choice", "options": { "a": "Juring lingkaran", "b": "Lingkaran penuh", "c": "Segitiga", "d": "Persegi panjang" }, "correct_answer": "a", "explanation": "Selimut kerucut berbentuk juring (potongan) lingkaran dengan jari-jari = garis pelukis", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 8, "id": "2e45bb13-46dc-4464-896e-da47d7f92200", "lesson_id": "d490346b-96a3-4b74-9473-61b5b38b0924", "question_text": "Rumus luas permukaan kerucut adalah...", "question_type": "multiple_choice", "options": { "a": "πr(r + s)", "b": "πr²s", "c": "2πr(r + s)", "d": "πrs" }, "correct_answer": "a", "explanation": "Luas permukaan kerucut = luas alas + luas selimut = πr² + πrs = πr(r + s), dimana s adalah garis pelukis", "difficulty": "medium", "points": 15, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 9, "id": "31e5d873-463d-4eb1-ac28-1c04d4e8add1", "lesson_id": "dcd96a9a-8735-4d1d-b0fa-906b0ec4c685", "question_text": "Berapa banyak sisi pada jaring-jaring kerucut?", "question_type": "multiple_choice", "options": { "a": "2", "b": "1", "c": "3", "d": "4" }, "correct_answer": "a", "explanation": "Jaring-jaring kerucut terdiri dari 1 lingkaran (alas) dan 1 juring lingkaran (selimut)", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 10, "id": "3df0040e-4b2f-42b8-91a3-10eb6d9cac39", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Jika sebuah bola memiliki volume 36π cm³, berapakah luas permukaan bola tersebut?", "question_type": "multiple_choice", "options": { "a": "18π cm²", "b": "72π cm²", "c": "12π cm²", "d": "36π cm²" }, "correct_answer": "d", "explanation": "V = (4/3)πr³ = 36π → r³ = 27 → r = 3 cm. L = 4πr² = 4π(3)² = 36π cm²", "difficulty": "hard", "points": 15, "order_index": 4, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 11, "id": "3e105d17-23b4-4050-a4fe-45b58c3e66fe", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Sebuah bola basket memiliki diameter 28 cm. Jika π = 22/7, berapakah volume bola basket tersebut?", "question_type": "multiple_choice", "options": { "a": "11.498,67 cm³", "b": "38.808 cm³", "c": "45.994,67 cm³", "d": "56.406 cm³" }, "correct_answer": "a", "explanation": "r = 28/2 = 14 cm. V = (4/3)πr³ = (4/3) × (22/7) × 14³ = (4/3) × (22/7) × 2.744 = 11.498,67 cm³", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 12, "id": "42451245-bee8-4707-af5e-eeb49de8cfde", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Sebuah kamar mandi kecil berbentuk ¼ tabung tanpa tutup memiliki jari-jari alas 1,4 m dan tinggi 2 m. Hitunglah luas permukaan kamar mandi yang perlu dipasang keramik. Gunakan π = 3,14.", "question_type": "essay", "options": null, "correct_answer": "L = (1/4)(2πrt) + (1/4)(πr²) + 2rt = (1/4)(2×3,14×1,4×2) + (1/4)(3,14×1,96) + (2×1,4×2) = 2,198 + 1,5386 + 5,6 = 9,3366 m² ≈ 9,34 m²", "explanation": "Luas permukaan ¼ tabung tanpa tutup terdiri dari: ¼ selimut tabung + ¼ alas + 2 sisi tegak (persegi panjang). L = (1/4)(2πrt) + (1/4)(πr²) + 2rt", "difficulty": "hard", "points": 20, "order_index": 5, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 13, "id": "465bafca-f4ab-49c1-85ae-4340a2b921c7", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Sebuah kelapa telah dibelah menjadi setengah bola memiliki jari-jari 10 cm. Berapakah luas permukaan belahan kelapa tersebut?", "question_type": "multiple_choice", "options": { "a": "100π cm²", "b": "150π cm²", "c": "200π cm²", "d": "400π cm²" }, "correct_answer": "c", "explanation": "L ½ bola = ½(4πr²) + πr² = 2πr² + πr² = 3πr² = 3π(10)² = 300π. Tapi yang ditanya luas permukaan lengkap ½ bola = 2πr² (lengkung) + πr² (datar) = 3π(100) = 300π cm²", "difficulty": "medium", "points": 10, "order_index": 1, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 14, "id": "4c00d254-c054-40e8-b67a-140512ecd939", "lesson_id": "f5e2f83e-b518-4859-b7c5-fede3c7d6d53", "question_text": "Jika jari-jari bola 3 cm, berapa volumenya?", "question_type": "multiple_choice", "options": { "a": "113.04 cm³", "b": "28.26 cm³", "c": "84.78 cm³", "d": "36 cm³" }, "correct_answer": "a", "explanation": "V = ⁴⁄₃πr³ = ⁴⁄₃ × 3.14 × 3³ ≈ 113.04 cm³", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 15, "id": "5230fc76-e839-4c5a-878f-ec48ef09fb65", "lesson_id": "ec43f654-5eaf-4494-abc7-6b47d0158994", "question_text": "Jika jari-jari tabung 7 cm dan tinggi 10 cm, berapa volumenya?", "question_type": "multiple_choice", "options": { "a": "1540 cm³", "b": "154 cm³", "c": "440 cm³", "d": "220 cm³" }, "correct_answer": "a", "explanation": "V = πr²h = 22/7 × 7² × 10 = 1540 cm³", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 16, "id": "5c80ed4d-67de-4af0-8e53-293473afd57d", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Sebuah kue ulang tahun berbentuk tabung bertingkat tiga. Jari-jari alas tabung berturut-turut dari bawah adalah 20 cm, 15 cm, dan 10 cm. Sedangkan tinggi di setiap tingkatnya sama yaitu 8 cm. Permukaan kue tersebut akan diolesi mentega. Setiap 5 gram mentega dapat diolesi ke 10 cm² permukaan kue. Harga 5 gram mentega yaitu Rp2.000,00. Jika setiap bagian alas kue yang paling bawah tidak diolesi mentega, berapa gram mentega yang dibutuhkan dan berapakah harga mentega untuk mengolesi permukaan kue? (π = 3,14)", "question_type": "essay", "options": null, "correct_answer": "L total = L tutup tingkat 1 + L selimut tingkat 1 + L tutup tingkat 2 + L selimut tingkat 2 + L tutup tingkat 3 + L selimut tingkat 3. L = πr₁² + 2πr₁t + πr₂² + 2πr₂t + πr₃² + 2πr₃t = 3,14(400 + 320 + 225 + 240 + 100 + 160) = 3,14(1445) = 4.537,3 cm². Mentega = (4537,3/10) × 5 = 2.268,65 gram ≈ 2.269 gram. Harga = (2269/5) × 2000 = Rp907.600", "explanation": "Hitung luas permukaan total semua tingkat kecuali alas bawah, kemudian hitung kebutuhan mentega berdasarkan rasio 5 gram per 10 cm²", "difficulty": "hard", "points": 20, "order_index": 6, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 17, "id": "5e09a2ed-6559-4661-8ad9-d444c5c6e824", "lesson_id": "ec43f654-5eaf-4494-abc7-6b47d0158994", "question_text": "Rumus luas permukaan tabung adalah...", "question_type": "multiple_choice", "options": { "a": "2πr(r + h)", "b": "πr²h", "c": "2πrh", "d": "πr(r + h)" }, "correct_answer": "a", "explanation": "Luas permukaan tabung = 2 × luas alas + luas selimut = 2πr² + 2πrh = 2πr(r + h)", "difficulty": "medium", "points": 15, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 18, "id": "64c7a0ec-42da-4441-bbb1-d786735f0e90", "lesson_id": "92f9be24-eb1b-4e9a-a4db-9f1d77d83dbe", "question_text": "Jika keliling alas tabung 44 cm dan tinggi 10 cm, berapa luas selimutnya?", "question_type": "multiple_choice", "options": { "a": "440 cm²", "b": "220 cm²", "c": "880 cm²", "d": "154 cm²" }, "correct_answer": "a", "explanation": "Luas selimut = keliling alas × tinggi = 44 × 10 = 440 cm²", "difficulty": "medium", "points": 15, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 19, "id": "6b4a1f38-9d38-4fbb-bd88-2b5b7e31076c", "lesson_id": "f5e2f83e-b518-4859-b7c5-fede3c7d6d53", "question_text": "Apa rumus volume bola?", "question_type": "multiple_choice", "options": { "a": "⁴⁄₃πr³", "b": "⅓πr³", "c": "πr³", "d": "2πr³" }, "correct_answer": "a", "explanation": "Volume bola dihitung dengan rumus 4/3 × π × r³", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 20, "id": "70b66819-1c07-4009-b2de-d2be144cd1e0", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Jika luas permukaan sebuah globe adalah 36π cm², berapakah jari-jari globe tersebut?", "question_type": "essay", "options": null, "correct_answer": "L = 4πr² → 36π = 4πr² → 36 = 4r² → r² = 9 → r = 3 cm", "explanation": "Dari rumus luas permukaan bola L = 4πr², substitusi nilai L yang diketahui dan selesaikan untuk mencari r", "difficulty": "medium", "points": 20, "order_index": 6, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 21, "id": "7124c08d-5abb-4253-ba3a-8551f27b8838", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Sebuah gelas minum besar berbentuk tabung memiliki tinggi 30 cm dan diameter 20 cm. Tentukan kapasitas gelas tersebut (volume) dan luas permukaan bagian dalam gelas yang terkena air! (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "Volume = 9.420 cm³, Luas permukaan = 2.828 cm²", "b": "Volume = 12.000 cm³, Luas permukaan = 3.142 cm²", "c": "Volume = 9.420 cm³, Luas permukaan = 2.828 cm²", "d": "Volume = 18.840 cm³, Luas permukaan = 6.283 cm²" }, "correct_answer": "a", "explanation": "Volume = πr²t = 3,14 × (10)² × 30 = 9.420 cm³. Luas permukaan = 2πrt + πr² = 2(3,14)(10)(30) + 3,14(100) = 2.828 cm²", "difficulty": "medium", "points": 10, "order_index": 1, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 22, "id": "782d4fc0-6c97-4dfc-ba34-e1ccc9fb0694", "lesson_id": "dcd96a9a-8735-4d1d-b0fa-906b0ec4c685", "question_text": "Panjang busur juring pada jaring-jaring kerucut sama dengan...", "question_type": "multiple_choice", "options": { "a": "Keliling alas kerucut", "b": "Diameter alas", "c": "Garis pelukis", "d": "Tinggi kerucut" }, "correct_answer": "a", "explanation": "Panjang busur juring = keliling lingkaran alas kerucut", "difficulty": "hard", "points": 20, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 23, "id": "86e6db17-549d-401b-afb4-a27e1e3cdf0f", "lesson_id": "f5e2f83e-b518-4859-b7c5-fede3c7d6d53", "question_text": "Sebuah bola memiliki diameter 10 cm. Berapa luas permukaannya?", "question_type": "multiple_choice", "options": { "a": "314 cm²", "b": "157 cm²", "c": "628 cm²", "d": "1256 cm²" }, "correct_answer": "a", "explanation": "r = 5 cm, L = 4πr² = 4 × 3.14 × 5² = 4 × 3.14 × 25 = 314 cm²", "difficulty": "medium", "points": 15, "order_index": 4, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 24, "id": "9d041f1f-6a50-465a-a748-d820dda1c6e9", "lesson_id": "d490346b-96a3-4b74-9473-61b5b38b0924", "question_text": "Sebuah kerucut memiliki jari-jari 5 cm dan garis pelukis 13 cm. Berapa luas permukaannya?", "question_type": "multiple_choice", "options": { "a": "282.6 cm²", "b": "204.1 cm²", "c": "360 cm²", "d": "565.2 cm²" }, "correct_answer": "a", "explanation": "L = πr(r + s) = 3.14 × 5 × (5 + 13) = 3.14 × 5 × 18 ≈ 282.6 cm²", "difficulty": "hard", "points": 20, "order_index": 4, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 25, "id": "a368c84e-ddcb-4d06-a4e8-7a6691a9c094", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Sebuah kaleng cat berbentuk tabung memiliki tinggi 10 cm dan dapat menampung 6.400 cm³ cat. Tentukanlah luas permukaan kaleng cat tersebut yang harus dilapisi label! (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "804,25 cm²", "b": "928 cm²", "c": "1.280 cm²", "d": "1.608 cm²" }, "correct_answer": "d", "explanation": "V = πr²t → 6400 = 3,14 × r² × 10 → r² ≈ 203,8 → r ≈ 14,3 cm. L = 2πr(r+t) = 2(3,14)(14,3)(14,3+10) ≈ 1.608 cm²", "difficulty": "hard", "points": 15, "order_index": 2, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 26, "id": "a7dc1da1-3d49-4dc9-8435-69c9176f9fb1", "lesson_id": "3a12fd4d-4e6e-4974-90e1-1a44ea37649e", "question_text": "Sebuah mangkuk es krim berbentuk setengah bola (hemisfer) dengan diameter 12 cm. Berapakah volume es krim yang dapat ditampung oleh mangkok tersebut? Gunakan nilai π = 3,14.", "question_type": "multiple_choice", "options": { "a": "226,08 cm³", "b": "904,32 cm³", "c": "452,16 cm³", "d": "376,8 cm³" }, "correct_answer": "c", "explanation": "r = 12/2 = 6 cm. V ½ bola = ½ × (4/3)πr³ = (2/3) × 3,14 × 6³ = (2/3) × 3,14 × 216 = 452,16 cm³", "difficulty": "medium", "points": 10, "order_index": 3, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 27, "id": "a8fe83c8-9720-4961-8f2c-6c378b75180c", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Sebuah Andi ingin membuat topi santa berbentuk kerucut untuk pesta natal. Topi tersebut memiliki tinggi 30 cm dan jari-jari alas 10 cm. Hitunglah volume topi kerucut Andi.", "question_type": "multiple_choice", "options": { "a": "314 cm³", "b": "1000 cm³", "c": "3140 cm³", "d": "300 cm³" }, "correct_answer": "c", "explanation": "V = (1/3)πr²t = (1/3) × 3,14 × 10² × 30 = (1/3) × 3,14 × 100 × 30 = 3.140 cm³", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 28, "id": "b095ce07-dc2b-4744-b690-afed6d050325", "lesson_id": "f5e2f83e-b518-4859-b7c5-fede3c7d6d53", "question_text": "Rumus luas permukaan bola adalah...", "question_type": "multiple_choice", "options": { "a": "4πr²", "b": "2πr²", "c": "πr²", "d": "3πr²" }, "correct_answer": "a", "explanation": "Luas permukaan bola = 4 × π × r²", "difficulty": "easy", "points": 10, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 29, "id": "bff58db6-bec1-4d3b-af93-c2d03c66f01d", "lesson_id": "ec43f654-5eaf-4494-abc7-6b47d0158994", "question_text": "Sebuah tabung memiliki diameter 14 cm dan tinggi 20 cm. Berapa luas permukaannya?", "question_type": "multiple_choice", "options": { "a": "1496 cm²", "b": "748 cm²", "c": "2992 cm²", "d": "1232 cm²" }, "correct_answer": "a", "explanation": "r = 7 cm, L = 2πr(r + h) = 2 × 22/7 × 7 × (7 + 20) = 44 × 34 = 1496 cm²", "difficulty": "hard", "points": 20, "order_index": 4, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 30, "id": "c08f8e1e-c785-4313-99aa-564dedbf1770", "lesson_id": "76c278f6-23d7-4b73-8ef2-73943ccb4af9", "question_text": "Apakah bola memiliki jaring-jaring?", "question_type": "multiple_choice", "options": { "a": "Tidak", "b": "Ya", "c": "Kadang-kadang", "d": "Tergantung ukuran" }, "correct_answer": "a", "explanation": "Bola tidak memiliki jaring-jaring karena permukaannya melengkung sempurna dan tidak dapat dibentangkan menjadi bidang datar", "difficulty": "easy", "points": 10, "order_index": 1, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 31, "id": "c62e0b42-e89e-4695-943b-536e977648a6", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Terdapat 3 buah traffic cone di jalan raya yang memiliki ukuran sama. Setiap cone memiliki tinggi 50 cm dan jari-jari alas 20 cm. Hitunglah jumlah volume ketiga traffic cone tersebut!", "question_type": "multiple_choice", "options": { "a": "20.000 cm³", "b": "62.832 cm³", "c": "66.000 cm³", "d": "62.400 cm³" }, "correct_answer": "b", "explanation": "V satu cone = (1/3)πr²t = (1/3) × 3,14 × 400 × 50 = 20.933,33 cm³. V 3 cone = 3 × 20.933,33 ≈ 62.800 cm³", "difficulty": "medium", "points": 10, "order_index": 3, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 32, "id": "c6947b60-aad1-4766-aa1a-f478d4dc8052", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Sebuah es krim cone berbentuk kerucut memiliki jari-jari 3,5 cm dan tinggi 10 cm. Hitunglah volume cone es krim tersebut! (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "102,7 cm³", "b": "128,3 cm³", "c": "160,1 cm³", "d": "192,5 cm³" }, "correct_answer": "b", "explanation": "V = (1/3)πr²t = (1/3) × 3,14 × (3,5)² × 10 = (1/3) × 3,14 × 12,25 × 10 ≈ 128,3 cm³", "difficulty": "easy", "points": 10, "order_index": 4, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 33, "id": "c7a25e18-5301-4316-9270-1994094d3e9b", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Sebuah drum minyak berbentuk tabung setinggi 35 cm dicat seluruh permukaannya. Luas permukaan drum tersebut adalah 4.710 cm². Berapa banyak minyak yang bisa ditampung drum itu (volume)? (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "16.170 cm³", "b": "18.480 cm³", "c": "19.980 cm³", "d": "22.050 cm³" }, "correct_answer": "d", "explanation": "Dari L = 2πr(r+t) → 4710 = 2(3,14)r(r+35). Selesaikan untuk r ≈ 15 cm. V = πr²t = 3,14 × 15² × 35 = 22.050 cm³", "difficulty": "hard", "points": 15, "order_index": 3, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 34, "id": "db71c4fb-1216-44e8-a834-5396d86794e3", "lesson_id": "92f9be24-eb1b-4e9a-a4db-9f1d77d83dbe", "question_text": "Bentuk selimut tabung pada jaring-jaring adalah...", "question_type": "multiple_choice", "options": { "a": "Persegi panjang", "b": "Lingkaran", "c": "Segitiga", "d": "Trapesium" }, "correct_answer": "a", "explanation": "Selimut tabung berbentuk persegi panjang dengan panjang = keliling alas dan lebar = tinggi tabung", "difficulty": "easy", "points": 10, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 35, "id": "dcea784a-3cd4-47e2-ab6f-bc40a687d7d1", "lesson_id": "1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f", "question_text": "Warga desa Sukajaya ingin mengganti atap tower air berbentuk kerucut menggunakan asbes berukuran 2 × 1 meter. Jari-jari atap adalah 5 m dan tingginya 4 m. Jika harga asbes adalah Rp 80.000 per satuan, berapakah biaya yang dibutuhkan untuk menutup atap tersebut? (π = 3,14)", "question_type": "essay", "options": null, "correct_answer": "Cari s: s = √(r² + t²) = √(25 + 16) = √41 ≈ 6,4 m. L selimut = πrs = 3,14 × 5 × 6,4 = 100,48 m². Luas per asbes = 2 × 1 = 2 m². Jumlah asbes = 100,48 / 2 = 50,24 ≈ 51 lembar. Biaya = 51 × 80.000 = Rp4.080.000", "explanation": "Hitung luas selimut kerucut, tentukan jumlah asbes yang dibutuhkan, lalu kalikan dengan harga per lembar asbes", "difficulty": "hard", "points": 20, "order_index": 6, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 36, "id": "dd566289-9ddd-4107-b56a-9d87eb035c40", "lesson_id": "76c278f6-23d7-4b73-8ef2-73943ccb4af9", "question_text": "Bangun ruang mana yang TIDAK memiliki jaring-jaring?", "question_type": "multiple_choice", "options": { "a": "Bola", "b": "Kubus", "c": "Limas", "d": "Prisma" }, "correct_answer": "a", "explanation": "Hanya bola yang tidak memiliki jaring-jaring karena tidak memiliki sisi datar", "difficulty": "easy", "points": 10, "order_index": 3, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null },
    { "idx": 37, "id": "e357aa89-abbc-46f6-8f4e-8c60a4027357", "lesson_id": "32e025a0-3b15-4a8f-a7a6-e990a5b8c784", "question_text": "Hitunglah volume ½ tabung yang berdiameter 21 cm dan tinggi 35 cm! (π = 3,14)", "question_type": "multiple_choice", "options": { "a": "6.079,25 cm³", "b": "7.693,5 cm³", "c": "8.110,25 cm³", "d": "11.539,5 cm³" }, "correct_answer": "b", "explanation": "r = 21/2 = 10,5 cm. V tabung = πr²t = 3,14 × (10,5)² × 35 = 12.158,25 cm³. V ½ tabung = 12.158,25 / 2 = 6.079,125 ≈ 6.079,25 cm³", "difficulty": "medium", "points": 10, "order_index": 4, "created_at": "2025-11-11 16:08:25.112724+00", "updated_at": "2025-11-11 16:08:25.112724+00", "acceptable_answers": null },
    { "idx": 38, "id": "ee66b4b3-e7f6-4b3e-ab61-070b0f4fa9fe", "lesson_id": "d490346b-96a3-4b74-9473-61b5b38b0924", "question_text": "Jika jari-jari kerucut 6 cm dan tinggi 8 cm, berapa volumenya?", "question_type": "multiple_choice", "options": { "a": "301.44 cm³", "b": "150.72 cm³", "c": "452.16 cm³", "d": "904.32 cm³" }, "correct_answer": "301.44 cm³", "explanation": "V = ⅓πr²h = ⅓ × 3.14 × 6² × 8 ≈ 301.44 cm³", "difficulty": "medium", "points": 15, "order_index": 2, "created_at": "2026-01-13 16:12:50.009698+00", "updated_at": "2026-01-13 16:12:50.009698+00", "acceptable_answers": null }
  ]

  // Filter questions based on moduleId
  // We need to map module IDs to their corresponding lesson IDs
  const moduleLessonMap: Record<string, string[]> = {
    // Tabung: 4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd
    '4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd': [
      '32e025a0-3b15-4a8f-a7a6-e990a5b8c784', // Konsep Dasar Tabung
      'd490346b-96a3-4b74-9473-61b5b38b0924', // Rumus Tabung
      'dcd96a9a-8735-4d1d-b0fa-906b0ec4c685'  // Jaring-jaring Tabung
    ],
    // Kerucut: 30e22668-7150-4e07-8c43-a4e9468c3e2f
    '30e22668-7150-4e07-8c43-a4e9468c3e2f': [
      '1bfbcb59-36e6-4732-a5fd-cc4e3d58d40f',
      'f5e2f83e-b518-4859-b7c5-fede3c7d6d53',
      '76c278f6-23d7-4b73-8ef2-73943ccb4af9'
    ],
    // Bola: a5e50615-afaf-492b-ba89-7a1b09e4b03a
    'a5e50615-afaf-492b-ba89-7a1b09e4b03a': [
      '3a12fd4d-4e6e-4974-90e1-1a44ea37649e',
      'ec43f654-5eaf-4494-abc7-6b47d0158994',
      '92f9be24-eb1b-4e9a-a4db-9f1d77d83dbe'
    ]
  }

  // Handle slug inputs
  let targetId = moduleId
  if (moduleId === 'tabung') targetId = '4ba28a6d-04b2-4a2f-8ca0-e48b75b19efd'
  if (moduleId === 'kerucut') targetId = '30e22668-7150-4e07-8c43-a4e9468c3e2f'
  if (moduleId === 'bola') targetId = 'a5e50615-afaf-492b-ba89-7a1b09e4b03a'

  const relevantLessonIds = moduleLessonMap[targetId] || []

  // Filter questions that belong to the relevant lessons
  const filteredQuestions = allQuestions.filter(q => relevantLessonIds.includes(q.lesson_id))

  // Map to QuizQuestion type (normalize keys if needed)
  return filteredQuestions.map(q => ({
    id: q.id,
    lesson_id: q.lesson_id,
    question_text: q.question_text,
    question_type: q.question_type as any,
    options: q.options as any,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty as any,
    points: q.points,
    order_index: q.order_index,
    created_at: q.created_at,
    updated_at: q.updated_at,
    acceptable_answers: q.acceptable_answers || undefined
  }))
}
