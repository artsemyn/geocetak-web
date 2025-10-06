// src/utils/debugQuizData.ts
// Script untuk debug dan perbaiki data quiz

import { supabase } from '../services/supabase'

/**
 * Debug: Tampilkan semua lesson dengan module
 */
export async function debugLessons() {
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      slug,
      title,
      lessons (
        id,
        title,
        lesson_type,
        slug
      )
    `)
    .in('slug', ['tabung', 'kerucut', 'bola'])
    .order('order_index')

  console.log('=== MODULES & LESSONS ===')
  modules?.forEach(module => {
    console.log(`\nModule: ${module.slug} - ${module.title}`)
    module.lessons?.forEach((lesson: any) => {
      console.log(`  Lesson: ${lesson.slug} (${lesson.lesson_type})`)
      console.log(`  ID: ${lesson.id}`)
    })
  })

  return modules
}

/**
 * Debug: Tampilkan quiz questions dengan lesson
 */
export async function debugQuizQuestions() {
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select(`
      id,
      question_text,
      lesson_id,
      order_index,
      lessons (
        id,
        title,
        slug,
        module_id,
        modules (
          slug,
          title
        )
      )
    `)
    .order('lesson_id')
    .order('order_index')

  console.log('\n=== QUIZ QUESTIONS ===')
  questions?.forEach(q => {
    const lesson: any = q.lessons
    const module: any = lesson?.modules
    console.log(`\nQuestion: ${q.question_text.substring(0, 50)}...`)
    console.log(`  Module: ${module?.slug}`)
    console.log(`  Lesson: ${lesson?.slug}`)
    console.log(`  Lesson ID: ${q.lesson_id}`)
  })

  return questions
}

/**
 * Perbaiki lesson_id berdasarkan konten pertanyaan
 */
export async function fixQuizLessonIds() {
  console.log('\n=== FIXING QUIZ LESSON IDs ===')

  // 1. Dapatkan lesson IDs yang benar
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id,
      slug,
      modules!inner (
        slug
      )
    `)
    .eq('lesson_type', 'quiz')
    .in('modules.slug', ['tabung', 'kerucut', 'bola'])

  if (!lessons) {
    console.error('Failed to fetch lessons')
    return
  }

  const lessonMap: Record<string, string> = {}
  lessons.forEach((lesson: any) => {
    const moduleSlug = lesson.modules.slug
    lessonMap[moduleSlug] = lesson.id
    console.log(`${moduleSlug} quiz lesson_id: ${lesson.id}`)
  })

  // 2. Update quiz questions untuk TABUNG
  if (lessonMap.tabung) {
    const { error: tabungError, count } = await supabase
      .from('quiz_questions')
      .update({ lesson_id: lessonMap.tabung })
      .or('question_text.ilike.%tabung%,question_text.ilike.%silinder%,question_text.ilike.%cylinder%')

    if (tabungError) {
      console.error('Error updating Tabung quiz:', tabungError)
    } else {
      console.log(`✓ Updated ${count} Tabung quiz questions`)
    }
  }

  // 3. Update quiz questions untuk KERUCUT
  if (lessonMap.kerucut) {
    const { error: kerucutError, count } = await supabase
      .from('quiz_questions')
      .update({ lesson_id: lessonMap.kerucut })
      .or('question_text.ilike.%kerucut%,question_text.ilike.%cone%,question_text.ilike.%garis pelukis%')

    if (kerucutError) {
      console.error('Error updating Kerucut quiz:', kerucutError)
    } else {
      console.log(`✓ Updated ${count} Kerucut quiz questions`)
    }
  }

  // 4. Update quiz questions untuk BOLA
  if (lessonMap.bola) {
    const { error: bolaError, count } = await supabase
      .from('quiz_questions')
      .update({ lesson_id: lessonMap.bola })
      .or('question_text.ilike.%bola%,question_text.ilike.%sphere%')

    if (bolaError) {
      console.error('Error updating Bola quiz:', bolaError)
    } else {
      console.log(`✓ Updated ${count} Bola quiz questions`)
    }
  }

  console.log('\n=== FIX COMPLETED ===')
}

/**
 * Debug: Tampilkan practice questions dengan module
 */
export async function debugPracticeQuestions() {
  console.log('\n=== PRACTICE QUESTIONS (Latihan Soal) ===')

  const { data: questions, error } = await supabase
    .from('practice_questions')
    .select(`
      id,
      question_text,
      module_id,
      difficulty_level,
      modules (
        id,
        slug,
        title
      )
    `)
    .order('module_id')
    .order('difficulty_level')

  if (error) {
    console.error('❌ Tabel practice_questions tidak ditemukan!')
    console.log('ℹ️  Tabel ini tidak ada di database Anda.')
    console.log('ℹ️  Jika Anda membutuhkan fitur practice questions, buat tabel dulu.')
    console.log('ℹ️  Jika tidak, gunakan quiz_questions saja (yang sudah ada).')
    return []
  }

  if (!questions || questions.length === 0) {
    console.log('ℹ️  Tabel practice_questions ada, tapi kosong (belum ada data)')
    return []
  }

  questions?.forEach(q => {
    const module: any = q.modules
    console.log(`\nQuestion: ${q.question_text.substring(0, 50)}...`)
    console.log(`  Module: ${module?.slug} (${module?.title})`)
    console.log(`  Module ID: ${q.module_id}`)
    console.log(`  Difficulty: ${q.difficulty_level}`)
  })

  return questions
}

/**
 * Perbaiki module_id di practice_questions
 */
export async function fixPracticeQuestions() {
  console.log('\n=== FIXING PRACTICE QUESTIONS MODULE IDs ===')

  // Check if table exists first
  const { error: checkError } = await supabase
    .from('practice_questions')
    .select('id')
    .limit(1)

  if (checkError) {
    console.error('❌ Tabel practice_questions tidak ada!')
    console.log('ℹ️  Tidak bisa memperbaiki data karena tabel tidak ditemukan.')
    console.log('ℹ️  Buat tabel dulu atau gunakan quiz_questions.')
    return
  }

  // 1. Dapatkan module IDs yang benar
  const { data: modules } = await supabase
    .from('modules')
    .select('id, slug, title')
    .in('slug', ['tabung', 'kerucut', 'bola'])

  if (!modules) {
    console.error('Failed to fetch modules')
    return
  }

  const moduleMap: Record<string, string> = {}
  modules.forEach((module: any) => {
    moduleMap[module.slug] = module.id
    console.log(`${module.slug} module_id: ${module.id}`)
  })

  // 2. Update practice questions untuk TABUNG
  if (moduleMap.tabung) {
    const { error: tabungError, count } = await supabase
      .from('practice_questions')
      .update({ module_id: moduleMap.tabung })
      .or('question_text.ilike.%tabung%,question_text.ilike.%silinder%,question_text.ilike.%cylinder%')

    if (tabungError) {
      console.error('Error updating Tabung practice questions:', tabungError)
    } else {
      console.log(`✓ Updated ${count} Tabung practice questions`)
    }
  }

  // 3. Update practice questions untuk KERUCUT
  if (moduleMap.kerucut) {
    const { error: kerucutError, count } = await supabase
      .from('practice_questions')
      .update({ module_id: moduleMap.kerucut })
      .or('question_text.ilike.%kerucut%,question_text.ilike.%cone%,question_text.ilike.%garis pelukis%')

    if (kerucutError) {
      console.error('Error updating Kerucut practice questions:', kerucutError)
    } else {
      console.log(`✓ Updated ${count} Kerucut practice questions`)
    }
  }

  // 4. Update practice questions untuk BOLA
  if (moduleMap.bola) {
    const { error: bolaError, count } = await supabase
      .from('practice_questions')
      .update({ module_id: moduleMap.bola })
      .or('question_text.ilike.%bola%,question_text.ilike.%sphere%')

    if (bolaError) {
      console.error('Error updating Bola practice questions:', bolaError)
    } else {
      console.log(`✓ Updated ${count} Bola practice questions`)
    }
  }

  console.log('\n=== FIX COMPLETED ===')
}

/**
 * Debug spesifik: Cek quiz untuk satu modul
 */
export async function debugQuizForModule(moduleSlug: string) {
  console.log(`\n=== DEBUG QUIZ UNTUK MODUL: ${moduleSlug.toUpperCase()} ===`)

  // 1. Get module and lesson
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      slug,
      title,
      lessons (
        id,
        title,
        slug,
        lesson_type
      )
    `)
    .eq('slug', moduleSlug)

  if (!modules || modules.length === 0) {
    console.error(`Module ${moduleSlug} tidak ditemukan`)
    return
  }

  const module = modules[0]
  console.log(`\nModule: ${module.title}`)
  console.log(`Lessons:`)
  module.lessons?.forEach((lesson: any) => {
    console.log(`  - ${lesson.title} (${lesson.lesson_type})`)
    console.log(`    ID: ${lesson.id}`)
  })

  // 2. Get quiz questions for this module's lessons
  const lessonIds = module.lessons?.map((l: any) => l.id) || []

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('lesson_id', lessonIds)
    .order('order_index')

  console.log(`\nQuiz Questions: ${questions?.length || 0} soal`)
  questions?.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.question_text.substring(0, 60)}...`)
    console.log(`     Lesson ID: ${q.lesson_id}`)
  })

  return { module, questions }
}

/**
 * Jalankan semua debug
 */
export async function runFullDebug() {
  console.log('🔍 Starting Quiz Data Debug...\n')

  await debugLessons()
  await debugQuizQuestions()
  await debugPracticeQuestions()

  console.log('\n\n💡 Jika data tidak sesuai:')
  console.log('   - Untuk quiz_questions: jalankan fixQuizLessonIds()')
  console.log('   - Untuk practice_questions: jalankan fixPracticeQuestions()')
  console.log('   - Atau ikuti panduan di fix-quiz-data.md')

  console.log('\n\n🔍 Debug spesifik per modul:')
  console.log('   - debugQuizForModule("tabung")')
  console.log('   - debugQuizForModule("kerucut")')
  console.log('   - debugQuizForModule("bola")')
}
