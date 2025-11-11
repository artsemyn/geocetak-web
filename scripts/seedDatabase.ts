// scripts/seedDatabase.ts
import { createClient } from '@supabase/supabase-js'

// Environment variables - make sure these are set
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample lessons data based on the PDF content
const lessonsData = [
  // TABUNG MODULE
  {
    module_slug: 'tabung',
    lessons: [
      {
        title: 'Pengenalan Tabung',
        slug: 'pengenalan-tabung',
        order_index: 1,
        content: {
          title: 'Pengenalan Tabung',
          description: 'Memahami konsep dasar tabung dan unsur-unsurnya',
          objectives: [
            'Memahami definisi tabung',
            'Mengenali unsur-unsur tabung',
            'Mengidentifikasi tabung dalam kehidupan sehari-hari'
          ],
          content: [
            {
              type: 'text',
              title: 'Apa itu Tabung?',
              content: 'Bayangkan kamu memiliki sebuah gelas berbentuk tabung yang kamu isi air. Berapa banyak air yang bisa ditampung oleh gelas tersebut? Tabung adalah bangun ruang sisi lengkung yang dibatasi oleh dua daerah lingkaran yang kongruen dan sebuah selimut tabung berbentuk daerah persegi panjang.'
            },
            {
              type: 'interactive',
              title: 'Eksplorasi 3D',
              content: 'Manipulasi model tabung untuk memahami bentuk dan unsur-unsurnya'
            }
          ],
          activities: [
            {
              id: 'tabung_intro_1',
              type: 'interactive-3d',
              title: 'Jelajahi Tabung',
              description: 'Putar dan perbesar model tabung untuk memahami bentuknya',
              config: {
                geometry: 'cylinder',
                parameters: { radius: 5, height: 10 }
              }
            }
          ]
        }
      },
      {
        title: 'Unsur-unsur Tabung',
        slug: 'unsur-unsur-tabung',
        order_index: 2,
        content: {
          title: 'Unsur-unsur Tabung',
          description: 'Mengenal bagian-bagian tabung dan sifat-sifatnya',
          objectives: [
            'Mengidentifikasi alas dan tutup tabung',
            'Memahami konsep jari-jari dan tinggi tabung',
            'Mengenal selimut tabung'
          ],
          content: [
            {
              type: 'text',
              title: 'Bagian-bagian Tabung',
              content: 'Berdasarkan gambar dan model 3D, unsur-unsur tabung sebagai berikut: • Daerah L1 dan L2 merupakan tutup dari tabung dengan L1 = L2 • Daerah persegi panjang ABCD merupakan selimut tabung • Jarak antara titik pusat pada L1 dan L2 disebut dengan tinggi tabung • r1 dan r2 merupakan jari jari tabung, dan r1 = r2'
            }
          ]
        }
      },
      {
        title: 'Jaring-jaring Tabung',
        slug: 'jaring-jaring-tabung',
        order_index: 3,
        content: {
          title: 'Jaring-jaring Tabung',
          description: 'Memahami jaring-jaring tabung melalui animasi 3D',
          objectives: [
            'Memahami konsep jaring-jaring',
            'Mengidentifikasi komponen jaring-jaring tabung',
            'Melihat transformasi 3D ke 2D'
          ],
          content: [
            {
              type: 'text',
              title: 'Jaring-jaring Tabung',
              content: 'Jaring-jaring tabung terdiri dari dua lingkaran kongruen (alas dan tutup) dan satu persegi panjang (selimut tabung). Mari eksplorasi dengan animasi 3D!'
            },
            {
              type: '3d-model',
              title: 'Animasi Jaring-jaring',
              content: 'Aktifkan mode jaring-jaring untuk melihat bagaimana tabung dapat dibuka menjadi bentuk 2D'
            }
          ],
          activities: [
            {
              id: 'tabung_net_1',
              type: 'net-animation',
              title: 'Animasi Jaring-jaring',
              description: 'Lihat bagaimana tabung dapat dibuka menjadi jaring-jaring',
              config: {
                geometry: 'cylinder'
              }
            }
          ]
        }
      },
      {
        title: 'Luas Permukaan Tabung',
        slug: 'luas-permukaan-tabung',
        order_index: 4,
        content: {
          title: 'Luas Permukaan Tabung',
          description: 'Menurunkan dan memahami rumus luas permukaan tabung',
          objectives: [
            'Memahami konsep luas permukaan',
            'Menurunkan rumus L = 2πr(r + t)',
            'Menerapkan rumus dalam perhitungan'
          ],
          content: [
            {
              type: 'formula',
              title: 'Rumus Luas Permukaan',
              content: 'Luas permukaan tabung = 2 × luas lingkaran + luas persegi panjang ABCD = 2πr² + 2πrt = 2πr(r + t)'
            }
          ],
          activities: [
            {
              id: 'tabung_surface_1',
              type: 'formula-discovery',
              title: 'Penemuan Rumus',
              description: 'Ubah parameter untuk melihat bagaimana rumus berubah',
              config: {
                geometry: 'cylinder',
                parameters: { radius: 5, height: 10 }
              }
            }
          ]
        }
      },
      {
        title: 'Volume Tabung',
        slug: 'volume-tabung',
        order_index: 5,
        content: {
          title: 'Volume Tabung',
          description: 'Memahami dan menerapkan rumus volume tabung',
          objectives: [
            'Memahami konsep volume',
            'Menurunkan rumus V = πr²t',
            'Membandingkan dengan bangun ruang lain'
          ],
          content: [
            {
              type: 'formula',
              title: 'Rumus Volume',
              content: 'Volume tabung = Luas alas × tinggi = πr² × t = πr²t'
            }
          ]
        }
      },
      {
        title: 'Soal Latihan Tabung',
        slug: 'soal-latihan-tabung',
        order_index: 6,
        content: {
          title: 'Soal Latihan Tabung',
          description: 'Menguji pemahaman dengan berbagai soal aplikasi',
          objectives: [
            'Menerapkan rumus dalam masalah nyata',
            'Menganalisis soal cerita',
            'Mengembangkan kemampuan problem solving'
          ],
          activities: [
            {
              id: 'tabung_problems_1',
              type: 'problem-solving',
              title: 'Latihan Soal',
              description: 'Kerjakan berbagai soal tentang tabung',
              config: {
                problems: [
                  {
                    id: 'tabung_1',
                    title: 'Gelas Tabung',
                    description: 'Sebuah gelas berbentuk tabung memiliki jari-jari 7 cm dan tinggi 18 cm. Hitunglah luas permukaan dan volume gelas tersebut!',
                    given_data: { radius: 7, height: 18 },
                    required_answer: 'Luas permukaan dan volume',
                    difficulty: 'easy'
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  },
  
  // KERUCUT MODULE  
  {
    module_slug: 'kerucut',
    lessons: [
      {
        title: 'Pengenalan Kerucut',
        slug: 'pengenalan-kerucut',
        order_index: 1,
        content: {
          title: 'Pengenalan Kerucut',
          description: 'Memahami konsep dasar kerucut dan bentuknya',
          objectives: [
            'Memahami definisi kerucut',
            'Mengenali kerucut dalam kehidupan sehari-hari',
            'Memahami perbedaan kerucut dengan bangun ruang lain'
          ],
          content: [
            {
              type: 'text',
              title: 'Apa itu Kerucut?',
              content: 'Pernahkah kamu melihat es krim cone? Bentuknya yang runcing ke atas adalah contoh nyata dari kerucut. Selain itu, topi ulang tahun dan traffic cone juga merupakan benda sehari-hari berbentuk kerucut.'
            }
          ]
        }
      },
      {
        title: 'Unsur-unsur Kerucut',
        slug: 'unsur-unsur-kerucut',
        order_index: 2,
        content: {
          title: 'Unsur-unsur Kerucut',
          description: 'Mengenal bagian-bagian kerucut termasuk garis pelukis',
          objectives: [
            'Mengidentifikasi alas kerucut',
            'Memahami konsep tinggi kerucut',
            'Mengenal garis pelukis dan hubungannya dengan teorema Pythagoras'
          ],
          content: [
            {
              type: 'text',
              title: 'Bagian-bagian Kerucut',
              content: 'Unsur-unsur kerucut: 1. Alas kerucut yang berbentuk lingkaran 2. Jari-jari kerucut (r) 3. Tinggi kerucut (t) 4. Garis pelukis (s) - jarak antara puncak kerucut ke tepi alas kerucut'
            },
            {
              type: 'formula',
              title: 'Hubungan Pythagoras',
              content: 'Berdasarkan teorema Pythagoras: s² = r² + t²'
            }
          ]
        }
      },
      {
        title: 'Jaring-jaring Kerucut',
        slug: 'jaring-jaring-kerucut',
        order_index: 3,
        content: {
          title: 'Jaring-jaring Kerucut',
          description: 'Memahami jaring-jaring kerucut: lingkaran dan juring',
          activities: [
            {
              id: 'kerucut_net_1',
              type: 'net-animation',
              title: 'Animasi Jaring-jaring Kerucut',
              description: 'Lihat bagaimana kerucut dapat dibuka menjadi juring dan lingkaran',
              config: {
                geometry: 'cone'
              }
            }
          ]
        }
      },
      {
        title: 'Luas Permukaan Kerucut',
        slug: 'luas-permukaan-kerucut',
        order_index: 4,
        content: {
          title: 'Luas Permukaan Kerucut',
          description: 'Menurunkan rumus L = πr(r + s)',
          content: [
            {
              type: 'formula',
              title: 'Rumus Luas Permukaan Kerucut',
              content: 'Luas permukaan kerucut = Luas alas + Luas selimut = πr² + πrs = πr(r + s)'
            }
          ]
        }
      },
      {
        title: 'Volume Kerucut',
        slug: 'volume-kerucut',
        order_index: 5,
        content: {
          title: 'Volume Kerucut',
          description: 'Memahami hubungan volume kerucut dengan tabung',
          content: [
            {
              type: 'text',
              title: 'Volume Kerucut',
              content: 'Volume kerucut = 1/3 × volume tabung dengan alas dan tinggi yang sama'
            },
            {
              type: 'formula',
              title: 'Rumus Volume',
              content: 'V = 1/3 × πr²t'
            }
          ]
        }
      },
      {
        title: 'Soal Latihan Kerucut',
        slug: 'soal-latihan-kerucut',
        order_index: 6,
        content: {
          title: 'Soal Latihan Kerucut',
          description: 'Latihan soal aplikasi kerucut'
        }
      }
    ]
  },
  
  // BOLA MODULE
  {
    module_slug: 'bola',
    lessons: [
      {
        title: 'Pengenalan Bola',
        slug: 'pengenalan-bola',
        order_index: 1,
        content: {
          title: 'Pengenalan Bola',
          description: 'Memahami konsep dasar bola dan simetrinya',
          content: [
            {
              type: 'text',
              title: 'Apa itu Bola?',
              content: 'Kita sering kali melihat bola, baik itu bola sepak, bola voli, bola basket atau bola lainnya. Bola adalah bangun ruang yang dibentuk oleh tak hingga lingkaran yang berpusat pada satu titik dengan jari-jari yang sama.'
            }
          ]
        }
      },
      {
        title: 'Luas Permukaan Bola',
        slug: 'luas-permukaan-bola',
        order_index: 2,
        content: {
          title: 'Luas Permukaan Bola',
          description: 'Percobaan Archimedes dan rumus L = 4πr²',
          content: [
            {
              type: 'text',
              title: 'Percobaan Archimedes',
              content: 'Archimedes menemukan bahwa luas permukaan bola sama dengan 4 kali luas lingkaran dengan jari-jari yang sama.'
            },
            {
              type: 'formula',
              title: 'Rumus Luas Permukaan Bola',
              content: 'L = 4πr²'
            }
          ]
        }
      },
      {
        title: 'Volume Bola',
        slug: 'volume-bola',
        order_index: 3,
        content: {
          title: 'Volume Bola',
          description: 'Rumus volume bola dan perbandingan dengan tabung',
          content: [
            {
              type: 'formula',
              title: 'Rumus Volume Bola',
              content: 'V = 4/3 πr³'
            }
          ]
        }
      },
      {
        title: 'Soal Latihan Bola',
        slug: 'soal-latihan-bola',
        order_index: 4,
        content: {
          title: 'Soal Latihan Bola',
          description: 'Latihan soal aplikasi bola'
        }
      }
    ]
  }
]

import { supabase } from '../services/supabase'

interface QuizQuestionData {
  module_slug: string
  lesson_order?: number
  question_text: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  order_index: number
}

interface PracticeQuestionData {
  module_slug: string
  question_text: string
  question_type: 'essay'
  correct_answer: string
  explanation: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  points: number
}

// ================== DATA TABUNG ==================
const tabungQuizData: QuizQuestionData[] = [
  {
    module_slug: 'tabung',
    question_text: 'Sebuah gelas minum besar berbentuk tabung memiliki tinggi 30 cm dan diameter 20 cm. Tentukan kapasitas gelas tersebut (volume) dan luas permukaan bagian dalam gelas yang terkena air! (π = 3,14)',
    options: {
      a: 'Volume = 9.420 cm³, Luas permukaan = 2.828 cm²',
      b: 'Volume = 12.000 cm³, Luas permukaan = 3.142 cm²',
      c: 'Volume = 9.420 cm³, Luas permukaan = 2.828 cm²',
      d: 'Volume = 18.840 cm³, Luas permukaan = 6.283 cm²'
    },
    correct_answer: 'a',
    explanation: 'Volume = πr²t = 3,14 × (10)² × 30 = 9.420 cm³. Luas permukaan = 2πrt + πr² = 2(3,14)(10)(30) + 3,14(100) = 2.828 cm²',
    difficulty: 'medium',
    points: 10,
    order_index: 1
  },
  {
    module_slug: 'tabung',
    question_text: 'Sebuah kaleng cat berbentuk tabung memiliki tinggi 10 cm dan dapat menampung 6.400 cm³ cat. Tentukanlah luas permukaan kaleng cat tersebut yang harus dilapisi label! (π = 3,14)',
    options: {
      a: '804,25 cm²',
      b: '928 cm²',
      c: '1.280 cm²',
      d: '1.608 cm²'
    },
    correct_answer: 'd',
    explanation: 'V = πr²t → 6400 = 3,14 × r² × 10 → r² ≈ 203,8 → r ≈ 14,3 cm. L = 2πr(r+t) = 2(3,14)(14,3)(14,3+10) ≈ 1.608 cm²',
    difficulty: 'hard',
    points: 15,
    order_index: 2
  },
  // ... tambahkan soal lain
]

const tabungPracticeData: PracticeQuestionData[] = [
  {
    module_slug: 'tabung',
    question_text: 'Sebuah kamar mandi kecil berbentuk ¼ tabung tanpa tutup memiliki jari-jari alas 1,4 m dan tinggi 2 m. Hitunglah luas permukaan kamar mandi yang perlu dipasang keramik. Gunakan π = 3,14.',
    question_type: 'essay',
    correct_answer: 'Luas ≈ 9,89 m²',
    explanation: 'L = ¼(2πrt + πr²) + 2rt = ¼(2×3,14×1,4×2 + 3,14×1,96) + 2(1,4)(2) ≈ 9,89 m²',
    difficulty_level: 'hard',
    points: 20
  },
  // ... tambahkan soal lain
]

// ================== DATA KERUCUT ==================
const kerucutQuizData: QuizQuestionData[] = [
  {
    module_slug: 'kerucut',
    question_text: 'Sebuah Andi ingin membuat topi santa berbentuk kerucut untuk pesta natal. Topi tersebut memiliki tinggi 30 cm dan jari-jari alas 10 cm. Hitunglah volume topi kerucut Andi.',
    options: {
      a: '314 cm³',
      b: '1000 cm³',
      c: '3140 cm³',
      d: '300 cm³'
    },
    correct_answer: 'c',
    explanation: 'V = (1/3)πr²t = (1/3) × 3,14 × 10² × 30 = 3.140 cm³',
    difficulty: 'easy',
    points: 10,
    order_index: 1
  },
  // ... tambahkan soal lain
]

const kerucutPracticeData: PracticeQuestionData[] = [
  {
    module_slug: 'kerucut',
    question_text: 'Sebuah payung taman memiliki bentuk kerucut. Payung tersebut memiliki tinggi 1,5 meter, panjang garis pelukis 4 meter dan jari-jari alas 3 meter. Hitunglah luas permukaan payung tersebut.',
    question_type: 'essay',
    correct_answer: 'L = 65,94 m²',
    explanation: 'L = πr(r + s) = 3,14 × 3 × (3 + 4) = 65,94 m²',
    difficulty_level: 'medium',
    points: 20
  },
  // ... tambahkan soal lain
]

// ================== DATA BOLA ==================
const bolaQuizData: QuizQuestionData[] = [
  {
    module_slug: 'bola',
    question_text: 'Sebuah kelapa telah dibelah menjadi setengah bola memiliki jari-jari 10 cm. Berapakah luas permukaan belahan kelapa tersebut?',
    options: {
      a: '100π cm²',
      b: '150π cm²',
      c: '200π cm²',
      d: '400π cm²'
    },
    correct_answer: 'c',
    explanation: 'L ½ bola lengkap = 2πr² (lengkung) + πr² (datar) = 3πr² = 300π cm²',
    difficulty: 'medium',
    points: 10,
    order_index: 1
  },
  // ... tambahkan soal lain
]

const bolaPracticeData: PracticeQuestionData[] = [
  {
    module_slug: 'bola',
    question_text: 'Tentukan volume sebuah bola voli jika diameternya 14 cm. Gunakan π = 22/7.',
    question_type: 'essay',
    correct_answer: 'V = 1.437,33 cm³',
    explanation: 'r = 7 cm. V = (4/3)πr³ = (4/3) × (22/7) × 343 = 1.437,33 cm³',
    difficulty_level: 'easy',
    points: 15
  },
  // ... tambahkan soal lain
]

// ================== SEED FUNCTIONS ==================

async function seedQuizQuestions() {
  console.log('🌱 Seeding quiz questions...')
  
  const allQuizData = [
    ...tabungQuizData,
    ...kerucutQuizData,
    ...bolaQuizData
  ]

  for (const quizData of allQuizData) {
    // Get module
    const { data: module } = await supabase
      .from('modules')
      .select('id')
      .eq('slug', quizData.module_slug)
      .single()

    if (!module) {
      console.error(`Module not found: ${quizData.module_slug}`)
      continue
    }

    // Get first lesson of module
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', module.id)
      .order('order_index')
      .limit(1)
      .single()

    if (!lesson) {
      console.error(`No lessons found for module: ${quizData.module_slug}`)
      continue
    }

    // Insert quiz question
    const { error } = await supabase
      .from('quiz_questions')
      .insert({
        lesson_id: lesson.id,
        question_text: quizData.question_text,
        options: quizData.options,
        correct_answer: quizData.correct_answer,
        explanation: quizData.explanation,
        difficulty: quizData.difficulty,
        points: quizData.points,
        order_index: quizData.order_index
      })

    if (error) {
      console.error(`Error inserting quiz question:`, error)
    } else {
      console.log(`✅ Quiz question added for ${quizData.module_slug}`)
    }
  }
}

async function seedPracticeQuestions() {
  console.log('🌱 Seeding practice questions...')
  
  const allPracticeData = [
    ...tabungPracticeData,
    ...kerucutPracticeData,
    ...bolaPracticeData
  ]

  for (const practiceData of allPracticeData) {
    // Get module
    const { data: module } = await supabase
      .from('modules')
      .select('id')
      .eq('slug', practiceData.module_slug)
      .single()

    if (!module) {
      console.error(`Module not found: ${practiceData.module_slug}`)
      continue
    }

    // Insert practice question
    const { error } = await supabase
      .from('practice_questions')
      .insert({
        module_id: module.id,
        question_text: practiceData.question_text,
        question_type: practiceData.question_type,
        options: null,
        correct_answer: practiceData.correct_answer,
        explanation: practiceData.explanation,
        difficulty_level: practiceData.difficulty_level,
        points: practiceData.points,
        is_active: true
      })

    if (error) {
      console.error(`Error inserting practice question:`, error)
    } else {
      console.log(`✅ Practice question added for ${practiceData.module_slug}`)
    }
  }
}

async function seedAll() {
  await seedQuizQuestions()
  await seedPracticeQuestions()
  console.log('✨ Seeding complete!')
}

seedAll()

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Get existing modules
    const { data: modules, error: moduleError } = await supabase
      .from('modules')
      .select('id, slug')
    
    if (moduleError) {
      throw moduleError
    }
    
    console.log('📚 Found modules:', modules?.map(m => m.slug))
    
    // Seed lessons for each module
    for (const moduleData of lessonsData) {
      const module = modules?.find(m => m.slug === moduleData.module_slug)
      
      if (!module) {
        console.log(`❌ Module not found: ${moduleData.module_slug}`)
        continue
      }
      
      console.log(`📖 Seeding lessons for module: ${moduleData.module_slug}`)
      
      // Delete existing lessons for this module (optional - for clean seeding)
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('module_id', module.id)
      
      if (deleteError) {
        console.log(`⚠️  Warning: Could not delete existing lessons: ${deleteError.message}`)
      }
      
      // Insert new lessons
      const lessonsToInsert = moduleData.lessons.map(lesson => ({
        module_id: module.id,
        title: lesson.title,
        slug: lesson.slug,
        content: lesson.content,
        order_index: lesson.order_index
      }))
      
      const { data: insertedLessons, error: insertError } = await supabase
        .from('lessons')
        .insert(lessonsToInsert)
        .select()
      
      if (insertError) {
        console.error(`❌ Error inserting lessons for ${moduleData.module_slug}:`, insertError)
        continue
      }
      
      console.log(`✅ Successfully inserted ${insertedLessons?.length || 0} lessons for ${moduleData.module_slug}`)
    }
    
    console.log('🎉 Database seeding completed!')
    
    // Display summary
    const { data: totalLessons } = await supabase
      .from('lessons')
      .select('id')
    
    console.log(`📊 Total lessons in database: ${totalLessons?.length || 0}`)
    
  } catch (error) {
    console.error('💥 Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase()
}