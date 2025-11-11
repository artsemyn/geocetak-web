// scripts/debugAndFixQuiz.ts
// Script untuk debug dan perbaiki masalah quiz questions

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// STEP 1: DEBUG - Lihat struktur data saat ini
// ============================================

async function debugCurrentState() {
  console.log('\n🔍 DEBUGGING CURRENT STATE\n')
  console.log('=' .repeat(60))

  // 1. Check modules
  const { data: modules } = await supabase
    .from('modules')
    .select('id, slug, name')
    .in('slug', ['tabung', 'kerucut', 'bola'])

  console.log('\n📚 MODULES:')
  modules?.forEach(m => {
    console.log(`  - ${m.slug} (ID: ${m.id}): ${m.name}`)
  })

  // 2. Check lessons untuk setiap module
  console.log('\n📖 LESSONS:')
  for (const module of modules || []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, slug, lesson_type, order_index')
      .eq('module_id', module.id)
      .order('order_index')

    console.log(`\n  Module: ${module.slug}`)
    lessons?.forEach(l => {
      console.log(`    ${l.order_index}. ${l.title}`)
      console.log(`       - ID: ${l.id}`)
      console.log(`       - Slug: ${l.slug}`)
      console.log(`       - Type: ${l.lesson_type || 'N/A'}`)
    })
  }

  // 3. Check quiz questions
  const { data: quizQuestions } = await supabase
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
          name
        )
      )
    `)
    .order('lesson_id')

  console.log('\n❓ QUIZ QUESTIONS:')
  console.log(`Total: ${quizQuestions?.length || 0} soal\n`)
  
  quizQuestions?.forEach((q, idx) => {
    const lesson: any = q.lessons
    const module: any = lesson?.modules
    console.log(`${idx + 1}. ${q.question_text.substring(0, 60)}...`)
    console.log(`   Module: ${module?.slug || 'UNKNOWN'}`)
    console.log(`   Lesson: ${lesson?.slug || 'UNKNOWN'} (ID: ${q.lesson_id})`)
    console.log(`   Order: ${q.order_index}`)
    console.log('')
  })

  // 4. Identify problems
  console.log('\n⚠️  POTENTIAL ISSUES:')
  
  const issuesFound = []
  
  // Check if lesson_type exists
  const { data: lessonsWithType } = await supabase
    .from('lessons')
    .select('id, lesson_type')
    .eq('lesson_type', 'quiz')
  
  if (!lessonsWithType || lessonsWithType.length === 0) {
    issuesFound.push('❌ No lessons with lesson_type="quiz" found')
    console.log('   - Tabel lessons tidak memiliki kolom lesson_type, atau')
    console.log('   - Tidak ada lesson dengan lesson_type="quiz"')
  }

  // Check if quiz questions have correct lesson_id
  const groupedByLesson = quizQuestions?.reduce((acc, q) => {
    acc[q.lesson_id] = (acc[q.lesson_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (groupedByLesson) {
    console.log('\n📊 Quiz Questions per Lesson:')
    Object.entries(groupedByLesson).forEach(([lessonId, count]) => {
      console.log(`   Lesson ID ${lessonId}: ${count} soal`)
    })
  }

  if (issuesFound.length === 0) {
    console.log('   ✅ No obvious issues found')
  } else {
    issuesFound.forEach(issue => console.log(`   ${issue}`))
  }

  console.log('\n' + '='.repeat(60))
}

// ============================================
// STEP 2: FIX - Perbaiki lesson_id
// ============================================

async function fixQuizQuestions() {
  console.log('\n🔧 FIXING QUIZ QUESTIONS\n')
  console.log('=' .repeat(60))

  // Strategy 1: Gunakan lesson dengan title "Soal Latihan"
  console.log('\n📝 Strategy: Match by lesson title "Soal Latihan"')
  
  const { data: modules } = await supabase
    .from('modules')
    .select('id, slug, name')
    .in('slug', ['tabung', 'kerucut', 'bola'])

  for (const module of modules || []) {
    console.log(`\n  Processing module: ${module.slug}`)
    
    // Find lesson dengan title mengandung "Soal Latihan" atau "Quiz"
    const { data: quizLessons } = await supabase
      .from('lessons')
      .select('id, title, slug')
      .eq('module_id', module.id)
      .or('title.ilike.%soal latihan%,title.ilike.%quiz%,slug.ilike.%latihan%')
      .limit(1)

    if (!quizLessons || quizLessons.length === 0) {
      console.log(`  ⚠️  No quiz lesson found for ${module.slug}`)
      console.log(`  💡 Suggestion: Create a lesson or use the last lesson`)
      continue
    }

    const quizLesson = quizLessons[0]
    console.log(`  ✓ Found quiz lesson: ${quizLesson.title} (ID: ${quizLesson.id})`)

    // Update quiz questions berdasarkan konten
    let updated = 0
    
    if (module.slug === 'tabung') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: quizLesson.id })
        .or('question_text.ilike.%tabung%,question_text.ilike.%silinder%,question_text.ilike.%gelas%')
        
      updated = count || 0
    } else if (module.slug === 'kerucut') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: quizLesson.id })
        .or('question_text.ilike.%kerucut%,question_text.ilike.%cone%,question_text.ilike.%topi%')
        
      updated = count || 0
    } else if (module.slug === 'bola') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: quizLesson.id })
        .or('question_text.ilike.%bola%,question_text.ilike.%sphere%,question_text.ilike.%kelapa%')
        
      updated = count || 0
    }

    console.log(`  ✅ Updated ${updated} quiz questions`)
  }

  console.log('\n' + '='.repeat(60))
}

// ============================================
// STEP 3: ALTERNATIVE - Gunakan lesson terakhir
// ============================================

async function useLastLessonAsQuiz() {
  console.log('\n🔄 ALTERNATIVE: Using last lesson as quiz lesson\n')
  console.log('=' .repeat(60))

  const { data: modules } = await supabase
    .from('modules')
    .select('id, slug, name')
    .in('slug', ['tabung', 'kerucut', 'bola'])

  for (const module of modules || []) {
    console.log(`\n  Processing module: ${module.slug}`)
    
    // Get last lesson (highest order_index)
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('module_id', module.id)
      .order('order_index', { ascending: false })
      .limit(1)

    if (!lessons || lessons.length === 0) {
      console.log(`  ⚠️  No lessons found for ${module.slug}`)
      continue
    }

    const lastLesson = lessons[0]
    console.log(`  ✓ Using last lesson: ${lastLesson.title} (ID: ${lastLesson.id})`)

    // Update quiz questions
    let updated = 0
    
    if (module.slug === 'tabung') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: lastLesson.id })
        .or('question_text.ilike.%tabung%,question_text.ilike.%silinder%,question_text.ilike.%gelas%')
        
      updated = count || 0
    } else if (module.slug === 'kerucut') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: lastLesson.id })
        .or('question_text.ilike.%kerucut%,question_text.ilike.%cone%,question_text.ilike.%topi%')
        
      updated = count || 0
    } else if (module.slug === 'bola') {
      const { count } = await supabase
        .from('quiz_questions')
        .update({ lesson_id: lastLesson.id })
        .or('question_text.ilike.%bola%,question_text.ilike.%sphere%,question_text.ilike.%kelapa%')
        
      updated = count || 0
    }

    console.log(`  ✅ Updated ${updated} quiz questions`)
  }

  console.log('\n' + '='.repeat(60))
}

// ============================================
// STEP 4: VERIFY - Cek hasil perbaikan
// ============================================

async function verifyFix() {
  console.log('\n✅ VERIFICATION AFTER FIX\n')
  console.log('=' .repeat(60))

  const { data: modules } = await supabase
    .from('modules')
    .select('id, slug')
    .in('slug', ['tabung', 'kerucut', 'bola'])

  for (const module of modules || []) {
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('module_id', module.id)

    console.log(`\n📚 Module: ${module.slug}`)
    
    for (const lesson of lessons || []) {
      const { count } = await supabase
        .from('quiz_questions')
        .select('id', { count: 'exact', head: true })
        .eq('lesson_id', lesson.id)

      if (count && count > 0) {
        console.log(`  ✓ ${lesson.title}: ${count} soal`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('\n🚀 QUIZ QUESTIONS DEBUG & FIX TOOL')
  console.log('===================================\n')

  // Get command line argument
  const command = process.argv[2]

  switch (command) {
    case 'debug':
      await debugCurrentState()
      break
    
    case 'fix':
      await debugCurrentState()
      console.log('\n⏳ Starting fix in 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      await fixQuizQuestions()
      await verifyFix()
      break
    
    case 'fix-alt':
      await debugCurrentState()
      console.log('\n⏳ Starting alternative fix in 3 seconds...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      await useLastLessonAsQuiz()
      await verifyFix()
      break
    
    case 'verify':
      await verifyFix()
      break
    
    default:
      console.log('Usage:')
      console.log('  npm run debug-quiz debug     - Debug current state')
      console.log('  npm run debug-quiz fix       - Debug and fix (match by title)')
      console.log('  npm run debug-quiz fix-alt   - Debug and fix (use last lesson)')
      console.log('  npm run debug-quiz verify    - Verify after fix')
      console.log('')
      console.log('Running debug mode by default...\n')
      await debugCurrentState()
  }

  console.log('\n✨ Done!\n')
}

main().catch(console.error)