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