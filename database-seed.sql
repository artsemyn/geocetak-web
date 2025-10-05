-- ============================================
-- GEOCETAK DATABASE SEED
-- Mengisi database dengan konten pembelajaran
-- Berdasarkan fallback data yang ada di aplikasi
-- ============================================
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase SQL Editor
-- 2. Copy-paste seluruh file ini
-- 3. Klik "Run" atau tekan Ctrl+Enter
--
-- CATATAN:
-- - Script ini menggunakan ON CONFLICT untuk update jika data sudah ada
-- - Data lesson disimpan di kolom scene_config (JSONB)
-- - Content property akan di-parse otomatis oleh aplikasi
-- ============================================

-- Bersihkan data lama (opsional - uncomment jika ingin reset)
-- DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE slug IN ('tabung', 'kerucut', 'bola'));
-- DELETE FROM modules WHERE slug IN ('tabung', 'kerucut', 'bola');

-- ============================================
-- 1. INSERT MODULES
-- ============================================

-- Metode 1: Menggunakan DO untuk pengecekan
DO $$
BEGIN
  -- Insert atau update Tabung
  IF EXISTS (SELECT 1 FROM modules WHERE slug = 'tabung') THEN
    UPDATE modules SET
      title = 'Tabung',
      description = 'Modul ini membahas bentuk geometri tabung secara visual 3D, dilengkapi animasi interaktif, rumus volume dan luas permukaan, serta latihan soal berbasis masalah nyata',
      order_index = 1,
      is_published = true,
      updated_at = NOW()
    WHERE slug = 'tabung';
  ELSE
    INSERT INTO modules (id, title, slug, description, icon_url, order_index, is_published, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Tabung', 'tabung', 'Modul ini membahas bentuk geometri tabung secara visual 3D, dilengkapi animasi interaktif, rumus volume dan luas permukaan, serta latihan soal berbasis masalah nyata', NULL, 1, true, NOW(), NOW());
  END IF;

  -- Insert atau update Kerucut
  IF EXISTS (SELECT 1 FROM modules WHERE slug = 'kerucut') THEN
    UPDATE modules SET
      title = 'Kerucut',
      description = 'Modul ini menyajikan konsep kerucut dengan animasi interaktif, penjelasan garis pelukis, perhitungan volume, serta penerapan pada kehidupan sehari-hari',
      order_index = 2,
      is_published = true,
      updated_at = NOW()
    WHERE slug = 'kerucut';
  ELSE
    INSERT INTO modules (id, title, slug, description, icon_url, order_index, is_published, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Kerucut', 'kerucut', 'Modul ini menyajikan konsep kerucut dengan animasi interaktif, penjelasan garis pelukis, perhitungan volume, serta penerapan pada kehidupan sehari-hari', NULL, 2, true, NOW(), NOW());
  END IF;

  -- Insert atau update Bola
  IF EXISTS (SELECT 1 FROM modules WHERE slug = 'bola') THEN
    UPDATE modules SET
      title = 'Bola',
      description = 'Modul ini mengajarkan konsep bola secara visual, meliputi simetri, jaring-jaring bola, perhitungan volume dan luas permukaan, serta penerapan dalam kehidupan sehari-hari',
      order_index = 3,
      is_published = true,
      updated_at = NOW()
    WHERE slug = 'bola';
  ELSE
    INSERT INTO modules (id, title, slug, description, icon_url, order_index, is_published, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Bola', 'bola', 'Modul ini mengajarkan konsep bola secara visual, meliputi simetri, jaring-jaring bola, perhitungan volume dan luas permukaan, serta penerapan dalam kehidupan sehari-hari', NULL, 3, true, NOW(), NOW());
  END IF;
END $$;

-- ============================================
-- 2. INSERT LESSONS - TABUNG
-- ============================================

INSERT INTO lessons (
  id,
  module_id,
  slug,
  title,
  lesson_type,
  order_index,
  scene_config,
  estimated_duration_minutes,
  xp_reward,
  is_published,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = 'tabung'),
  'tabung-pembelajaran',
  'Pembelajaran Tabung',
  'interactive',
  1,
  jsonb_build_object(
    'concept', jsonb_build_object(
      'title', '🎯 Konsep dan Unsur-unsur Tabung',
      'content', '<p>Tabung adalah bangun ruang yang dibatasi oleh dua bidang lingkaran yang sejajar dan kongruen (sama bentuk dan ukuran) serta sebuah bidang lengkung yang disebut selimut tabung. Bayangkan sebuah kaleng susu atau gelas; itulah bentuk tabung dalam kehidupan sehari-hari.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'card',
          'title', '🔵 Sisi Alas dan Tutup',
          'content', '<p>Dua lingkaran yang identik dan sejajar. Keduanya merupakan pusat dari tabung.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '🔄 Selimut Tabung',
          'content', '<p>Sisi lengkung yang menghubungkan alas dan tutup. Jika dibuka, akan berbentuk persegi panjang.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📏 Jari-jari (r)',
          'content', '<p>Jarak dari titik pusat lingkaran (alas/tutup) ke tepi lingkaran.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📐 Tinggi (t)',
          'content', '<p>Jarak tegak lurus antara bidang alas dan tutup tabung.</p>'
        )
      )
    ),
    'net', jsonb_build_object(
      'title', '🔄 Jaring-jaring Tabung',
      'content', '<p>Jika sebuah tabung kita potong pada beberapa rusuknya dan kita buka, maka akan terbentuk sebuah jaring-jaring tabung. Jaring-jaring ini memperlihatkan semua permukaan tabung dalam bentuk datar.</p><p>Seperti yang terlihat, jaring-jaring tabung terdiri dari:</p><ul><li><b>Dua buah lingkaran</b> yang sama besar, berfungsi sebagai alas dan tutup.</li><li><b>Satu buah persegi panjang</b> yang berfungsi sebagai selimut tabung. Panjang persegi panjang ini sama dengan keliling lingkaran alas, dan lebarnya sama dengan tinggi tabung.</li></ul>'
    ),
    'formula', jsonb_build_object(
      'title', '🧮 Penemuan Rumus Tabung',
      'content', '<p>Dengan memahami jaring-jaring tabung, kita bisa dengan mudah menurunkan rumus untuk menghitung luas permukaan dan volumenya.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'alert',
          'title', 'Volume Tabung',
          'content', '<p>Prinsip volume untuk bangun ruang seperti tabung (dan prisma) adalah <b>Luas Alas × Tinggi</b>. Luas Alas (Lingkaran) = πr², maka Volume = (πr²) × t</p><p><b>Rumus: V = πr²t</b></p>',
          'props', jsonb_build_object('severity', 'info')
        ),
        jsonb_build_object(
          'type', 'alert',
          'title', 'Luas Permukaan Tabung',
          'content', '<p>Luas permukaan adalah total luas dari semua sisi pada jaring-jaringnya. Luas = (2 × Luas Alas) + Luas Selimut = (2 × πr²) + (2πr × t)</p><p><b>Rumus: L = 2πr(r + t)</b></p>',
          'props', jsonb_build_object('severity', 'warning')
        )
      )
    ),
    'quiz', jsonb_build_object(
      'title', '📝 Quiz dan Latihan',
      'content', '<p>Contoh soal latihan:</p><p><b>Soal 1:</b> Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Hitunglah:</p><ul><li>a) Luas permukaan tabung</li><li>b) Volume tabung</li></ul><p><i>💡 Gunakan kontrol di atas untuk mengatur parameter r=7 dan t=10, lalu lihat hasilnya!</i></p>'
    )
  ),
  30,
  100,
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 3. INSERT LESSONS - KERUCUT
-- ============================================

INSERT INTO lessons (
  id,
  module_id,
  slug,
  title,
  lesson_type,
  order_index,
  scene_config,
  estimated_duration_minutes,
  xp_reward,
  is_published,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = 'kerucut'),
  'kerucut-pembelajaran',
  'Pembelajaran Kerucut',
  'interactive',
  1,
  jsonb_build_object(
    'concept', jsonb_build_object(
      'title', '🎯 Konsep dan Unsur-unsur Kerucut',
      'content', '<p>Kerucut adalah bangun ruang yang memiliki alas berbentuk lingkaran dan memiliki satu titik puncak. Bayangkan sebuah topi ulang tahun atau cone es krim; itulah bentuk kerucut dalam kehidupan sehari-hari.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'card',
          'title', '🔵 Alas Kerucut',
          'content', '<p>Lingkaran yang menjadi dasar kerucut.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '🌙 Selimut Kerucut',
          'content', '<p>Sisi lengkung yang menghubungkan alas dengan titik puncak. Jika dibuka, akan berbentuk juring lingkaran.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📏 Jari-jari (r)',
          'content', '<p>Jarak dari titik pusat alas ke tepi lingkaran alas.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📐 Tinggi (t)',
          'content', '<p>Jarak tegak lurus dari alas ke titik puncak kerucut.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📏 Garis Pelukis (s)',
          'content', '<p>Jarak dari tepi alas ke titik puncak kerucut. s = √(r² + t²)</p>'
        )
      )
    ),
    'net', jsonb_build_object(
      'title', '🔄 Jaring-jaring Kerucut',
      'content', '<p>Jika sebuah kerucut kita potong pada beberapa bagiannya dan kita buka, maka akan terbentuk sebuah jaring-jaring kerucut. Jaring-jaring ini memperlihatkan semua permukaan kerucut dalam bentuk datar.</p><p>Seperti yang terlihat, jaring-jaring kerucut terdiri dari:</p><ul><li><b>Satu buah lingkaran</b> yang berfungsi sebagai alas kerucut.</li><li><b>Satu buah juring lingkaran</b> yang berfungsi sebagai selimut kerucut. Panjang busur juring ini sama dengan keliling lingkaran alas.</li></ul>'
    ),
    'formula', jsonb_build_object(
      'title', '🧮 Penemuan Rumus Kerucut',
      'content', '<p>Dengan memahami jaring-jaring kerucut, kita bisa dengan mudah menurunkan rumus untuk menghitung luas permukaan dan volumenya.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'alert',
          'title', 'Volume Kerucut',
          'content', '<p>Volume kerucut adalah sepertiga dari volume tabung dengan alas dan tinggi yang sama. Karena volume tabung = πr²t, maka volume kerucut = ⅓ × πr²t</p><p><b>Rumus: V = ⅓πr²t</b></p>',
          'props', jsonb_build_object('severity', 'info')
        ),
        jsonb_build_object(
          'type', 'alert',
          'title', 'Luas Permukaan Kerucut',
          'content', '<p>Luas permukaan terdiri dari luas alas dan luas selimut. Luas = Luas Alas + Luas Selimut = πr² + πrs = πr(r + s), dimana s adalah garis pelukis</p><p><b>Rumus: L = πr(r + s)</b></p>',
          'props', jsonb_build_object('severity', 'warning')
        )
      )
    ),
    'quiz', jsonb_build_object(
      'title', '📝 Quiz dan Latihan',
      'content', '<p>Contoh soal latihan:</p><p><b>Soal 1:</b> Sebuah kerucut memiliki jari-jari 6 cm dan tinggi 8 cm. Hitunglah:</p><ul><li>a) Garis pelukis (s)</li><li>b) Luas permukaan kerucut</li><li>c) Volume kerucut</li></ul><p><i>💡 Gunakan kontrol di atas untuk mengatur parameter dan lihat hasilnya!</i></p>'
    )
  ),
  30,
  100,
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 4. INSERT LESSONS - BOLA
-- ============================================

INSERT INTO lessons (
  id,
  module_id,
  slug,
  title,
  lesson_type,
  order_index,
  scene_config,
  estimated_duration_minutes,
  xp_reward,
  is_published,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM modules WHERE slug = 'bola'),
  'bola-pembelajaran',
  'Pembelajaran Bola',
  'interactive',
  1,
  jsonb_build_object(
    'concept', jsonb_build_object(
      'title', '🎯 Konsep dan Unsur-unsur Bola',
      'content', '<p>Bola adalah bangun ruang yang semua titik pada permukaannya berjarak sama dari pusat. Bayangkan sebuah bola sepak, bola basket, atau planet; itulah bentuk bola dalam kehidupan sehari-hari.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'card',
          'title', '🎯 Pusat Bola',
          'content', '<p>Titik yang berada tepat di tengah bola, berjarak sama ke semua titik di permukaan.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📏 Jari-jari (r)',
          'content', '<p>Jarak dari pusat bola ke sembarang titik di permukaan bola.</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '📐 Diameter (d)',
          'content', '<p>Jarak terpanjang antara dua titik di permukaan bola yang melalui pusat. d = 2r</p>'
        ),
        jsonb_build_object(
          'type', 'card',
          'title', '🌐 Permukaan Bola',
          'content', '<p>Seluruh sisi lengkung bola yang membentuk bidang sferis.</p>'
        )
      )
    ),
    'net', jsonb_build_object(
      'title', '🔄 Visualisasi Bola',
      'content', '<p>Bola tidak memiliki jaring-jaring dalam arti tradisional karena permukaannya adalah satu bidang lengkung kontinu. Namun, kita dapat memproyeksikan permukaan bola ke bidang datar dengan berbagai cara.</p><p>Untuk visualisasi bola:</p><ul><li><b>Proyeksi silindris</b> seperti peta dunia yang membentang dari kutub ke kutub.</li><li><b>Proyeksi sferis</b> yang membagi bola menjadi bagian-bagian seperti kulit jeruk.</li></ul>'
    ),
    'formula', jsonb_build_object(
      'title', '🧮 Penemuan Rumus Bola',
      'content', '<p>Rumus bola memiliki keunikan tersendiri karena sifat simetrisnya yang sempurna.</p>',
      'elements', jsonb_build_array(
        jsonb_build_object(
          'type', 'alert',
          'title', 'Volume Bola',
          'content', '<p>Volume bola dihitung menggunakan rumus V = ⁴⁄₃πr³, dimana r adalah jari-jari bola. Formula ini diturunkan dari integral kalkulus.</p><p><b>Rumus: V = ⁴⁄₃πr³</b></p>',
          'props', jsonb_build_object('severity', 'info')
        ),
        jsonb_build_object(
          'type', 'alert',
          'title', 'Luas Permukaan Bola',
          'content', '<p>Luas permukaan bola adalah empat kali luas lingkaran dengan jari-jari yang sama. Karena luas lingkaran = πr², maka luas permukaan bola = 4 × πr² = 4πr²</p><p><b>Rumus: L = 4πr²</b></p>',
          'props', jsonb_build_object('severity', 'warning')
        )
      )
    ),
    'quiz', jsonb_build_object(
      'title', '📝 Quiz dan Latihan',
      'content', '<p>Contoh soal latihan:</p><p><b>Soal 1:</b> Sebuah bola memiliki jari-jari 10 cm. Hitunglah:</p><ul><li>a) Luas permukaan bola</li><li>b) Volume bola</li></ul><p><i>💡 Gunakan kontrol di atas untuk mengatur parameter r=10 dan lihat hasilnya!</i></p>'
    )
  ),
  30,
  100,
  true,
  NOW(),
  NOW()
);

-- ============================================
-- SELESAI
-- ============================================

-- Tampilkan hasil
SELECT
  m.title as module_name,
  l.title as lesson_name,
  l.slug,
  l.lesson_type,
  l.is_published
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
WHERE m.slug IN ('tabung', 'kerucut', 'bola')
ORDER BY m.order_index, l.order_index;
