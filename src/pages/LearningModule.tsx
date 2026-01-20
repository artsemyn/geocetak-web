// src/pages/LearningModule.tsx
import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Grid,
  Container,
  Typography,
  Box,
  IconButton,
  Button,
  Slider,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Stack,
  CircularProgress,
  Avatar,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Refresh,
  ViewInAr,
  Calculate,
  School,
  Assignment,
  MenuBookRounded,
  Settings,
  Quiz,
  TuneRounded,
  ExpandMore,
  Science,
  Computer,
  Engineering,
  Palette,
  Functions,
  RocketLaunch
} from '@mui/icons-material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useLearningStore } from '../stores/learningStore'
import { AssessmentHistory } from '../components/ai/AssessmentHistory'
import { ContentElement } from '../types'
import { EnhancedNetVisualization } from '../components/3d/geometries/EnhancedNetVisualization'
import { QuizSection } from '../components/quiz/QuizSection'
import { AssignmentSection } from '../components/assignment/AssignmentSection'

// Dynamic 3D Components for different geometries
function InteractiveCylinder() {
  const { geometryParams } = useLearningStore()
  const scale = 0.3

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow scale={[scale, scale, scale]}>
      <cylinderGeometry
        args={[geometryParams.radius, geometryParams.radius, geometryParams.height, 32]}
      />
      <meshStandardMaterial
        color="#667eea"
        metalness={0.2}
        roughness={0.4}
        transparent={false}
        opacity={1}
      />
    </mesh>
  )
}

function InteractiveCone() {
  const { geometryParams } = useLearningStore()
  const scale = 0.3
  const { radius, height } = geometryParams

  // Calculate slant height for proper cone geometry
  const slantHeight = Math.sqrt(radius * radius + height * height)

  return (
    <group scale={[scale, scale, scale]}>
      {/* Main cone body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <coneGeometry
          args={[radius, height, 64]}
        />
        <meshStandardMaterial
          color="#f39c12"
          metalness={0.3}
          roughness={0.3}
          transparent={true}
          opacity={0.9}
          flatShading={false}
        />
      </mesh>
    </group>
  )
}

function InteractiveSphere() {
  const { geometryParams } = useLearningStore()
  const scale = 0.3
  const { radius } = geometryParams

  return (
    <group scale={[scale, scale, scale]}>
      {/* Main sphere body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry
          args={[radius, 64, 64]}
        />
        <meshStandardMaterial
          color="#e74c3c"
          metalness={0.2}
          roughness={0.3}
          transparent={true}
          opacity={0.85}
          flatShading={false}
        />
      </mesh>
    </group>
  )
}

// Function to get the appropriate 3D component based on module
function getGeometryComponent(moduleSlug: string) {
  switch (moduleSlug) {
    case 'tabung':
      return <InteractiveCylinder />
    case 'kerucut':
      return <InteractiveCone />
    case 'bola':
      return <InteractiveSphere />
    default:
      return <InteractiveCylinder />
  }
}

// Helper function to map Indonesian geometry names to English
function mapGeometryType(moduleSlug: string): 'cylinder' | 'cone' | 'sphere' {
  switch (moduleSlug) {
    case 'tabung':
      return 'cylinder'
    case 'kerucut':
      return 'cone'
    case 'bola':
      return 'sphere'
    default:
      return 'cylinder'
  }
}

// Komponen Net Animation untuk Jaring-jaring
function CylinderNet() {
  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const circumference = 2 * Math.PI * radius

  // Scale down the net to match the cylinder scale
  const scale = 0.3

  return (
    <group scale={[scale, scale, scale]}>
      {/* Alas */}
      <mesh position={[0, -height / 2 - radius - 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color="#764ba2" side={2} />
      </mesh>
      {/* Tutup */}
      <mesh position={[0, height / 2 + radius + 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color="#764ba2" side={2} />
      </mesh>
      {/* Selimut */}
      <mesh>
        <planeGeometry args={[circumference, height]} />
        <meshStandardMaterial color="#667eea" side={2} />
      </mesh>
    </group>
  )
}

function ConeNet() {
  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const slantHeight = Math.sqrt(radius * radius + height * height)

  // Calculate sector angle for the cone net
  const sectorAngle = (2 * Math.PI * radius) / slantHeight
  const scale = 0.3

  return (
    <group scale={[scale, scale, scale]}>
      {/* Base circle */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color="#f39c12" side={2} />
      </mesh>

      {/* Sector (cone lateral surface) */}
      <mesh position={[radius + 2, 0, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0, slantHeight, 32, 1, 0, sectorAngle]} />
        <meshStandardMaterial color="#e67e22" side={2} />
      </mesh>

      {/* Guide lines showing how the sector wraps around */}
      <mesh position={[radius + 2, 0, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, slantHeight, 8]} />
        <meshStandardMaterial color="#d35400" />
      </mesh>

      <mesh position={[radius + 2, 0, 0]} rotation={[0, 0, sectorAngle]}>
        <cylinderGeometry args={[0.02, 0.02, slantHeight, 8]} />
        <meshStandardMaterial color="#d35400" />
      </mesh>
    </group>
  )
}

function SphereNet() {
  const { geometryParams } = useLearningStore()
  const { radius } = geometryParams
  const scale = 0.3

  return (
    <group scale={[scale, scale, scale]}>
      {/* Show sphere as orange slices/segments */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8
        const x = Math.cos(angle) * (radius + 1) * 2
        const z = Math.sin(angle) * (radius + 1) * 2

        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, angle, 0]}>
            <sphereGeometry args={[radius, 32, 32, 0, Math.PI / 4]} />
            <meshStandardMaterial
              color={`hsl(${i * 45}, 70%, 60%)`}
              side={2}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        )
      })}

      {/* Central sphere for reference */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
    </group>
  )
}

// Function to get the appropriate net component based on module
function getNetComponent(moduleSlug: string) {
  switch (moduleSlug) {
    case 'tabung':
      return <CylinderNet />
    case 'kerucut':
      return <ConeNet />
    case 'bola':
      return <SphereNet />
    default:
      return <CylinderNet />
  }
}

// Helper functions untuk perhitungan berdasarkan tipe modul
const calculateVolumeByType = (moduleSlug: string, radius: number, height: number) => {
  switch (moduleSlug) {
    case 'tabung':
      return Math.PI * radius * radius * height
    case 'kerucut':
      return (1 / 3) * Math.PI * radius * radius * height
    case 'bola':
      return (4 / 3) * Math.PI * Math.pow(radius, 3)
    default:
      return Math.PI * radius * radius * height
  }
}

const calculateSurfaceAreaByType = (moduleSlug: string, radius: number, height: number) => {
  switch (moduleSlug) {
    case 'tabung':
      return 2 * Math.PI * radius * (radius + height)
    case 'kerucut':
      const slantHeight = Math.sqrt(radius * radius + height * height)
      return Math.PI * radius * (radius + slantHeight)
    case 'bola':
      return 4 * Math.PI * radius * radius
    default:
      return 2 * Math.PI * radius * (radius + height)
  }
}

const getGeometryInfo = (moduleSlug: string) => {
  switch (moduleSlug) {
    case 'tabung':
      return {
        name: 'Tabung',
        emoji: '🔵',
        volumeFormula: 'V = πr²t',
        surfaceFormula: 'L = 2πr(r + t)',
        volumeDescription: 'Volume tabung = Luas alas × Tinggi',
        surfaceDescription: 'Luas permukaan = 2 × Luas alas + Luas selimut'
      }
    case 'kerucut':
      return {
        name: 'Kerucut',
        emoji: '🔺',
        volumeFormula: 'V = ⅓πr²t',
        surfaceFormula: 'L = πr(r + s)',
        volumeDescription: 'Volume kerucut = ⅓ × Luas alas × Tinggi',
        surfaceDescription: 'Luas permukaan = Luas alas + Luas selimut'
      }
    case 'bola':
      return {
        name: 'Bola',
        emoji: '⚽',
        volumeFormula: 'V = ⁴⁄₃πr³',
        surfaceFormula: 'L = 4πr²',
        volumeDescription: 'Volume bola menggunakan rumus khusus',
        surfaceDescription: 'Luas permukaan = 4 × Luas lingkaran'
      }
    default:
      return {
        name: 'Tabung',
        emoji: '🔵',
        volumeFormula: 'V = πr²t',
        surfaceFormula: 'L = 2πr(r + t)',
        volumeDescription: 'Volume tabung = Luas alas × Tinggi',
        surfaceDescription: 'Luas permukaan = 2 × Luas alas + Luas selimut'
      }
  }
}

// Helper function untuk mendapatkan data proyek STEAM berdasarkan modul
const getSTEAMProject = (moduleSlug: string) => {
  switch (moduleSlug) {
    case 'tabung':
      return {
        title: 'Proyek STEAM Mini – Desain Tempat Pensil 3D',
        subtitle: 'Eksplorasi Kreatif Berbasis Sains dan Teknologi',
        icon: '🎨',
        color: '#667eea',
        stages: [
          {
            icon: <Science />,
            emoji: '🔬',
            title: 'Science (Sains): Eksplorasi Bentuk Silinder',
            description: 'Tahap awal melibatkan observasi dan analisis. Peserta akan mempelajari dan mengidentifikasi benda-benda tabung (silinder) di sekitar mereka, seperti kaleng, botol, dan gelas. Fokusnya adalah memahami sifat-sifat geometris, stabilitas, dan fungsi praktis dari bentuk tabung dalam kehidupan sehari-hari sebagai wadah.'
          },
          {
            icon: <Computer />,
            emoji: '💻',
            title: 'Technology (Teknologi): Pemodelan Digital 3D',
            description: 'Selanjutnya, peserta akan memanfaatkan teknologi Computer-Aided Design (CAD). Mereka akan membuat desain digital model tabung tempat pensil menggunakan software pemodelan 3D seperti Tinkercad atau GeoCetak. Tahap ini melatih keterampilan navigasi perangkat lunak dan visualisasi spasial.'
          },
          {
            icon: <Engineering />,
            emoji: '📐',
            title: 'Engineering (Teknik): Penentuan Dimensi Fungsional',
            description: 'Pada tahap teknik, peserta menerapkan prinsip desain fungsional. Mereka harus menentukan ukuran yang presisi (tinggi dan jari-jari) dari tabung agar desain tersebut mampu menampung minimal 10 pensil standar secara efektif. Ini melibatkan pertimbangan toleransi, ketebalan dinding, dan optimasi ruang.'
          },
          {
            icon: <Palette />,
            emoji: '🎨',
            title: 'Art (Seni): Estetika dan Dekorasi',
            description: 'Aspek seni terintegrasi dalam personalisasi desain. Peserta didorong untuk menghias permukaan luar tabung dengan motif, tekstur, dan ornamen yang unik dan menarik. Pilihan warna dan pola akan ditentukan untuk menghasilkan tempat pensil yang tidak hanya fungsional tetapi juga memiliki nilai estetika pribadi.'
          },
          {
            icon: <Functions />,
            emoji: '🧮',
            title: 'Math (Matematika): Perhitungan Kuantitatif',
            description: 'Aplikasi matematika sangat krusial. Sebelum dicetak, peserta diwajibkan menghitung volume tempat pensil (untuk menentukan daya tampung internal) dan luas permukaannya (untuk estimasi material yang dibutuhkan). Perhitungan ini memvalidasi desain teknis dan memahami hubungan antara dimensi dan kuantitas material.'
          }
        ],
        output: {
          icon: <RocketLaunch />,
          title: 'Output dan Implementasi',
          description: 'Setelah semua tahapan selesai dan desain telah divalidasi, output finalnya adalah pencetakan model digital 3D menggunakan mesin 3D printer. Hasil akhirnya adalah tempat pensil fisik yang merupakan perwujudan nyata dari konsep, perhitungan, dan kreativitas yang telah dipelajari.'
        }
      }
    case 'kerucut':
      return {
        title: 'Proyek STEAM Mini – Desain Corong Pintar Modular 3D',
        subtitle: 'Integrasi Sains, Teknologi, dan Optimasi Aliran',
        icon: '🔬',
        color: '#f39c12',
        stages: [
          {
            icon: <Science />,
            emoji: '🔬',
            title: 'Science (Sains): Mempelajari Fluida dan Sudut Tiris',
            description: 'Fokus sains adalah pada ilmu material dan aliran. Peserta akan mempelajari sifat-sifat fluida (cairan dan butiran halus) dan hubungannya dengan sudut kemiringan (sudut tiris/angle of repose). Mereka akan menganalisis bagaimana sudut kerucut mempengaruhi laju dan kelancaran aliran material (misalnya, pasir, biji-bijian, atau air) melalui corong.'
          },
          {
            icon: <Computer />,
            emoji: '💻',
            title: 'Technology (Teknologi): Pemodelan Kerucut Fungsional di CAD',
            description: 'Peserta akan menerapkan pemodelan 3D untuk membuat desain. Mereka akan membuat model dasar kerucut corong menggunakan software CAD seperti Tinkercad atau GeoCetak. Bagian teknologi kunci adalah mendesain mekanisme modular di bagian bawah (sambungan ulir atau snap-fit) agar corong dapat dipasangkan dengan berbagai ukuran botol atau selang.'
          },
          {
            icon: <Engineering />,
            emoji: '📐',
            title: 'Engineering (Teknik): Optimalisasi Ukuran dan Efisiensi Aliran',
            description: 'Aspek teknik memerlukan pengambilan keputusan berdasarkan fungsi. Peserta harus menentukan dimensi kritis seperti tinggi, jari-jari alas, dan diameter lubang keluar dari kerucut. Tujuan engineering adalah mengoptimalkan sudut kemiringan corong untuk memastikan laju aliran maksimum tanpa sumbatan saat memindahkan 500 mL cairan dalam waktu tercepat.'
          },
          {
            icon: <Palette />,
            emoji: '🎨',
            title: 'Art (Seni): Estetika dan Identifikasi Cepat',
            description: 'Elemen seni terwujud dalam visualisasi fungsional. Peserta akan mengintegrasikan kode warna, penanda timbul (relief), atau motif tekstur pada permukaan luar corong. Hal ini bertujuan untuk membuat identifikasi corong berdasarkan fungsinya menjadi cepat dan intuitif (misalnya, corong untuk minyak diberi motif gelombang).'
          },
          {
            icon: <Functions />,
            emoji: '🧮',
            title: 'Math (Matematika): Perhitungan Volume dan Luas Selimut',
            description: 'Matematika adalah validasi desain. Peserta wajib menghitung volume kerucut (untuk menentukan kapasitas tampung maksimum) dan luas permukaan selimut kerucut (untuk estimasi kebutuhan material). Selain itu, mereka harus menghitung perbandingan antara volume dan ketinggian corong untuk memprediksi waktu pengisian.'
          }
        ],
        output: {
          icon: <RocketLaunch />,
          title: 'Output dan Implementasi',
          description: 'Setelah desain lengkap, divalidasi oleh perhitungan matematika, dan diverifikasi secara teknis, langkah terakhir adalah mencetak corong pintar menggunakan 3D printer. Hasilnya adalah corong modular fisik yang dapat diuji efektivitas alirannya sesuai dengan target engineering yang telah ditentukan.'
        }
      }
    case 'bola':
      return {
        title: 'Proyek STEAM Mini – Desain Wadah Dispenser Bola 3D',
        subtitle: 'Mekanika Gravitasi dan Desain Ruang Presisi',
        icon: '⚽',
        color: '#e74c3c',
        stages: [
          {
            icon: <Science />,
            emoji: '🔬',
            title: 'Science (Sains): Stabilitas, Gravitasi, dan Gesekan',
            description: 'Fokus sains adalah pada mekanika dasar. Peserta akan mempelajari pusat massa dan bagaimana menstabilkan bentuk bola agar tidak bergulir (melalui desain alas). Mereka akan menganalisis peran gravitasi dalam menarik isi ke lubang pengeluaran dan bagaimana gesekan antara objek yang dikeluarkan dan permukaan bola mempengaruhi kelancaran dispensing.'
          },
          {
            icon: <Computer />,
            emoji: '💻',
            title: 'Technology (Teknologi): Pemodelan Bola Berongga dan Mekanisme Tuas',
            description: 'Aspek teknologi melibatkan pemodelan 3D yang kompleks. Peserta akan membuat model digital bola berongga menggunakan software CAD (Tinkercad/GeoCetak). Tantangan utamanya adalah mendesain mekanisme tuas atau sliding door sederhana di bagian bawah bola yang memungkinkan satu item dikeluarkan pada satu waktu, tanpa objek lain ikut keluar.'
          },
          {
            icon: <Engineering />,
            emoji: '📐',
            title: 'Engineering (Teknik): Optimasi Kapasitas dan Mekanisme Pengeluaran',
            description: 'Pada tahap teknik, peserta harus menentukan desain yang optimal. Mereka perlu menentukan jari-jari bola agar memiliki kapasitas minimal 20 unit dari objek yang ditentukan (misalnya, permen diameter 2 cm). Mereka juga harus merancang dan menguji prototipe mekanisme pengeluaran agar memiliki fail-safe (keamanan) dan daya tahan (durabilitas) yang baik saat digunakan berulang kali.'
          },
          {
            icon: <Palette />,
            emoji: '🎨',
            title: 'Art (Seni): Estetika, Tekstur, dan Aksesibilitas',
            description: 'Elemen seni memfokuskan pada daya tarik visual dan ergonomi. Peserta didorong untuk menghias permukaan luar bola dengan tekstur yang menarik atau motif geometris untuk meningkatkan daya cengkeram (grip) saat dipegang. Penggunaan warna cerah atau desain karakter juga dapat diterapkan untuk membuat dispenser lebih menarik, terutama untuk anak-anak.'
          },
          {
            icon: <Functions />,
            emoji: '🧮',
            title: 'Math (Matematika): Perhitungan Volume dan Rasio Ruang',
            description: 'Matematika sangat penting untuk validasi. Peserta wajib menghitung volume bola (untuk menentukan total ruang internal) dan luas permukaannya. Lebih lanjut, mereka harus menghitung rasio kepadatan (packing ratio) untuk memperkirakan secara akurat berapa banyak item yang dapat dimuat dalam volume internal tersebut, dengan memperhitungkan ruang kosong di antaranya.'
          }
        ],
        output: {
          icon: <RocketLaunch />,
          title: 'Output dan Implementasi',
          description: 'Setelah semua perhitungan dan desain diverifikasi, output finalnya adalah mencetak dispenser bola menggunakan 3D printer. Hasil akhirnya adalah dispenser fisik yang mengintegrasikan mekanika gravitasi dengan desain ruang yang presisi, siap untuk diuji seberapa konsisten dan efisien mekanisme pengeluarannya.'
        }
      }
    default:
      return null
  }
}

export default function LearningModule() {
  const { moduleSlug } = useParams()
  const navigate = useNavigate()

  const {
    modules,
    currentModule,
    lessons,
    currentLesson,
    geometryParams,
    showNetAnimation,
    loading,
    setCurrentModule,
    setCurrentLesson,
    updateGeometryParams,
    toggleNetAnimation,
    fetchModules,
    trackTabVisit,
    getModuleTabProgress
  } = useLearningStore()

  // Get tab progress for visual indicators
  const tabProgress = currentModule?.id ? getModuleTabProgress(currentModule.id) : undefined

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const geometryInfo = getGeometryInfo(moduleSlug || 'tabung')

  useEffect(() => {
    fetchModules()

    // Set a timeout for loading state
    const timer = setTimeout(() => {
      console.warn('Loading timeout reached, forcing load completion')
      setLoadingTimeout(true)
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [fetchModules])

  useEffect(() => {
    console.log('LearningModule: modules changed', {
      modulesCount: modules.length,
      moduleSlug,
      availableSlugs: modules.map(m => m.slug)
    })
    if (modules.length > 0 && moduleSlug) {
      const module = modules.find(m => m.slug === moduleSlug)
      console.log('LearningModule: looking for module with slug', moduleSlug, 'found:', module)
      if (module) {
        setCurrentModule(module.id)
      } else {
        console.warn('LearningModule: Module not found for slug:', moduleSlug)
      }
    }
  }, [modules, moduleSlug, setCurrentModule])

  // Auto-select first lesson when lessons are loaded
  useEffect(() => {
    if (lessons.length > 0 && !currentLesson) {
      setCurrentLesson(lessons[0].id)
    }
  }, [lessons, currentLesson, setCurrentLesson])

  // Lesson tabs
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)

    // Map tab index to lesson type
    const lessonTypeMap: Record<number, string> = {
      0: 'concept',
      1: 'implementation',
      2: 'interactive',
      3: 'formula',
      4: 'quiz'
    }

    const targetType = lessonTypeMap[newValue]

    console.log(`[LearningModule] Tab changed to ${newValue} (Target: ${targetType})`)
    console.log('[LearningModule] Available lessons:', lessons.map(l => ({ id: l.id, type: l.lesson_type, slug: l.slug, title: l.title })))

    if (targetType && lessons.length > 0) {
      // Find lesson with matching type (case-insensitive)
      let foundLesson = lessons.find(l =>
        l.lesson_type?.toLowerCase() === targetType.toLowerCase()
      )

      // Fallback: search by slug or title if exact type match fails
      if (!foundLesson) {
        foundLesson = lessons.find(l =>
          l.slug.toLowerCase().includes(targetType) ||
          l.title.toLowerCase().includes(targetType)
        )
      }

      if (foundLesson) {
        console.log(`[LearningModule] Found matching lesson: ${foundLesson.title} (${foundLesson.id})`)
        setCurrentLesson(foundLesson.id)
      } else {
        console.warn(`[LearningModule] No lesson found for type '${targetType}'`)

        // Use default behavior for quiz: if strictly looking for quiz and none found, 
        // DO NOT just stay on current lesson (which might be Concept).
        // Try to find ANY lesson that looks like a quiz/evaluation
        if (targetType === 'quiz') {
          const potentialQuiz = lessons.find(l =>
            l.slug.includes('evaluasi') ||
            l.slug.includes('ujian') ||
            l.slug.includes('test') ||
            l.title.includes('Evaluasi')
          )
          if (potentialQuiz) {
            console.log(`[LearningModule] Fallback: Found potential quiz lesson: ${potentialQuiz.title}`)
            setCurrentLesson(potentialQuiz.id)
          } else {
            // CRITICAL: If still no quiz lesson found, we MUST try to use one if we are on the Quiz tab.
            // But we cannot create a fake ID here because QuizSection needs a REAL lesson ID to fetch questions.
            // If the user hasn't created a lesson for quiz, then there are no questions for it either.
            // We will let the UI show "No questions" or similar.
            // BUT, we should probably warn the user in the UI.
          }
        }
      }
    }

    // Track tab visit when user changes tab
    if (currentModule?.id) {
      trackTabVisit(currentModule.id, newValue)
    }
  }

  // Track initial tab visit on mount
  useEffect(() => {
    if (currentModule?.id) {
      trackTabVisit(currentModule.id, tabValue)
    }
  }, [currentModule?.id]) // Only run when module changes

  // Calculate formulas dinamis berdasarkan tipe modul
  const surfaceArea = calculateSurfaceAreaByType(moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)
  const volume = calculateVolumeByType(moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)

  const handleParameterChange = (param: string) => (event: Event, newValue: number | number[]) => {
    updateGeometryParams({ [param]: newValue as number })
  }

  const resetParameters = () => {
    updateGeometryParams({ radius: 5, height: 10 })
  }

  if ((loading && !loadingTimeout) || (!currentModule && !loadingTimeout)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    )
  }

  // Create synthetic module if still no current module after timeout
  const displayModule = currentModule || {
    id: 'fallback-module',
    title: geometryInfo.name,
    slug: moduleSlug || 'tabung',
    description: `Mempelajari bentuk geometri ${geometryInfo.name.toLowerCase()}`,
    icon_url: null,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" flexGrow={1}>
          {geometryInfo.emoji} Modul Pembelajaran: {displayModule.title}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Quiz />}
          onClick={() => navigate(`/practice/${currentModule?.id}`)}
          sx={{ ml: 2 }}
        >
          Latihan Soal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Kolom Kiri: Viewport 3D / Net Visualization */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ height: 500, position: 'relative', background: '#f0f4f8', borderRadius: 2 }}>
                {showNetAnimation && moduleSlug !== 'bola' ? (
                  // Show Enhanced Net Visualization when toggle is ON (not for sphere)
                  <EnhancedNetVisualization
                    geometryType={mapGeometryType(moduleSlug || 'tabung')}
                    show={true}
                  />
                ) : (
                  // Show 3D Geometry when toggle is OFF or for sphere
                  <Suspense fallback={<CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />}>
                    <Canvas shadows camera={{ position: [8, 6, 10], fov: 50 }}>
                      <ambientLight intensity={0.7} />
                      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                      <Environment preset="studio" />
                      {getGeometryComponent(moduleSlug || 'tabung')}
                      <ContactShadows opacity={0.5} scale={8} blur={1} far={10} resolution={256} color="#000000" />
                      <OrbitControls minDistance={2} maxDistance={25} />
                    </Canvas>
                  </Suspense>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Kolom Kanan: Kontrol */}
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">🎛️ Kontrol Interaktif</Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ px: 1 }}>
                <Typography gutterBottom>Jari-jari (r): {geometryParams.radius.toFixed(1)}</Typography>
                <Slider
                  value={geometryParams.radius}
                  onChange={handleParameterChange('radius')}
                  min={0.5}
                  max={5}
                  step={0.1}
                />

                {moduleSlug !== 'bola' && (
                  <>
                    <Typography gutterBottom>Tinggi (t): {geometryParams.height.toFixed(1)}</Typography>
                    <Slider
                      value={geometryParams.height}
                      onChange={handleParameterChange('height')}
                      min={0.5}
                      max={10}
                      step={0.1}
                    />
                  </>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {moduleSlug !== 'bola' && (
                  <FormControlLabel
                    control={<Switch checked={showNetAnimation} onChange={toggleNetAnimation} />}
                    label="Tampilkan Jaring-jaring"
                  />
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Dynamic Formulas */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <Calculate sx={{ mr: 1 }} />
                Perhitungan Otomatis
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  Luas Permukaan (L)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.8rem' }}>
                  {geometryInfo.surfaceFormula} = {surfaceArea.toFixed(2)} satuan²
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="secondary" fontWeight="bold">
                  Volume (V)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1, fontSize: '0.8rem' }}>
                  {geometryInfo.volumeFormula} = {volume.toFixed(2)} satuan³
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Konten Pelajaran di Bawah */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                <Tab
                  icon={<MenuBookRounded />}
                  label="Konsep"
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: 1
                    },
                    position: 'relative',
                    '&::after': tabProgress?.visitedTabs.includes(0) ? {
                      content: '"✓"',
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '12px',
                      color: '#27AE60',
                      fontWeight: 'bold'
                    } : {}
                  }}
                />
                <Tab
                  icon={<ViewInAr />}
                  label="Implementasi"
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: 1
                    },
                    position: 'relative',
                    '&::after': tabProgress?.visitedTabs.includes(1) ? {
                      content: '"✓"',
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '12px',
                      color: '#27AE60',
                      fontWeight: 'bold'
                    } : {}
                  }}
                />
                <Tab
                  icon={<Settings />}
                  label="Jaring-jaring"
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: 1
                    },
                    position: 'relative',
                    '&::after': tabProgress?.visitedTabs.includes(2) ? {
                      content: '"✓"',
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '12px',
                      color: '#27AE60',
                      fontWeight: 'bold'
                    } : {}
                  }}
                />
                <Tab
                  icon={<Calculate />}
                  label="Rumus"
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: 1
                    },
                    position: 'relative',
                    '&::after': tabProgress?.visitedTabs.includes(3) ? {
                      content: '"✓"',
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '12px',
                      color: '#27AE60',
                      fontWeight: 'bold'
                    } : {}
                  }}
                />
                <Tab
                  icon={<Quiz />}
                  label="Quiz"
                  iconPosition="start"
                  sx={{
                    '& .MuiTab-iconWrapper': {
                      marginRight: 1
                    },
                    position: 'relative',
                    '&::after': tabProgress?.visitedTabs.includes(4) ? {
                      content: '"✓"',
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontSize: '12px',
                      color: '#27AE60',
                      fontWeight: 'bold'
                    } : {}
                  }}
                />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}><ConceptLesson /></TabPanel>
            <TabPanel value={tabValue} index={1}><ImplementationLesson /></TabPanel>
            <TabPanel value={tabValue} index={2}><NetLesson /></TabPanel>
            <TabPanel value={tabValue} index={3}><FormulaLesson /></TabPanel>
            <TabPanel value={tabValue} index={4}><QuizLesson /></TabPanel>
          </Card>
        </Grid>

        {/* STEAM Project Card */}
        <Grid item xs={12}>
          <STEAMProjectCard moduleSlug={moduleSlug || 'tabung'} />
        </Grid>
      </Grid>
    </Container>
  )
}

// --- STEAM Project Card Component ---

const STEAMProjectCard: React.FC<{ moduleSlug: string }> = ({ moduleSlug }) => {
  const projectData = getSTEAMProject(moduleSlug)
  const [expandedStage, setExpandedStage] = useState<string | false>(false)

  if (!projectData) return null

  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedStage(isExpanded ? panel : false)
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${projectData.color}15 0%, ${projectData.color}05 100%)`,
        border: `2px solid ${projectData.color}40`,
        borderRadius: 3,
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '3rem', mb: 1 }}>
            {projectData.icon}
          </Typography>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: projectData.color }}>
            {projectData.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {projectData.subtitle}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Tahapan STEAM */}
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          📋 Tahapan Proyek
        </Typography>

        <Stack spacing={2}>
          {projectData.stages.map((stage, index) => (
            <Accordion
              key={index}
              expanded={expandedStage === `stage${index}`}
              onChange={handleAccordionChange(`stage${index}`)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: expandedStage === `stage${index}` ? 3 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: expandedStage === `stage${index}` ? `${projectData.color}10` : 'transparent',
                  '&:hover': { bgcolor: `${projectData.color}08` }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Avatar
                    sx={{
                      bgcolor: projectData.color,
                      width: 48,
                      height: 48,
                      fontSize: '1.5rem'
                    }}
                  >
                    {stage.emoji}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {stage.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Tahap ${index + 1}`}
                    size="small"
                    sx={{
                      bgcolor: projectData.color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2, pb: 3, px: 3 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                  {stage.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* Output Section */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${projectData.color}20 0%, ${projectData.color}10 100%)`,
            border: `2px solid ${projectData.color}`,
            borderRadius: 2
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              sx={{
                bgcolor: projectData.color,
                width: 56,
                height: 56,
                fontSize: '2rem'
              }}
            >
              🚀
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: projectData.color }}>
                {projectData.output.title}
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {projectData.output.description}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Alert severity="info" sx={{ maxWidth: 800, mx: 'auto' }}>
            💡 <strong>Tips:</strong> Gunakan kontrol interaktif di atas untuk bereksperimen dengan parameter geometri dan melihat bagaimana perubahan dimensi mempengaruhi volume dan luas permukaan!
          </Alert>
        </Box>
      </CardContent>
    </Card>
  )
}

// --- Dynamic Content Component ---

const DynamicContentElement: React.FC<{ element: ContentElement }> = ({ element }) => {
  switch (element.type) {
    case 'alert':
      return (
        <Alert severity={element.props?.severity || 'info'} sx={{ my: 2, ...element.props?.sx }}>
          {element.title && <Typography variant="body2" fontWeight="bold">{element.title}</Typography>}
          <div dangerouslySetInnerHTML={{ __html: element.content }} />
        </Alert>
      )

    case 'card':
      return (
        <Paper variant="outlined" sx={{ p: 2, my: 2, ...element.props?.sx }}>
          {element.title && <Typography variant="h6" gutterBottom>{element.title}</Typography>}
          <div dangerouslySetInnerHTML={{ __html: element.content }} />
        </Paper>
      )

    case 'text':
    default:
      return (
        <Box sx={{ my: 1 }}>
          {element.title && <Typography variant="h6" gutterBottom>{element.title}</Typography>}
          <div dangerouslySetInnerHTML={{ __html: element.content }} />
        </Box>
      )
  }
}

// --- Lesson Components ---

const TabPanel: React.FC<{ children?: React.ReactNode; index: number; value: number }> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
)

const ConceptLesson: React.FC = () => {
  const { currentLesson } = useLearningStore()
  const { moduleSlug } = useParams()
  const geometryInfo = getGeometryInfo(moduleSlug || 'tabung')
  const conceptContent = currentLesson?.content?.concept

  // Helper function untuk mendapatkan konten unsur-unsur berdasarkan modul
  const getElementsContent = (moduleSlug: string) => {
    switch (moduleSlug) {
      case 'tabung':
        return [
          { title: "Sisi Alas dan Tutup", desc: "Dua lingkaran yang identik dan sejajar. Keduanya merupakan pusat dari tabung.", icon: "🔵" },
          { title: "Selimut Tabung", desc: "Sisi lengkung yang menghubungkan alas dan tutup. Jika dibuka, akan berbentuk persegi panjang.", icon: "🔄" },
          { title: "Jari-jari (r)", desc: "Jarak dari titik pusat lingkaran (alas/tutup) ke tepi lingkaran.", icon: "📏" },
          { title: "Tinggi (t)", desc: "Jarak tegak lurus antara bidang alas dan tutup tabung.", icon: "📐" }
        ]
      case 'kerucut':
        return [
          { title: "Alas Kerucut", desc: "Lingkaran yang menjadi dasar kerucut.", icon: "🔵" },
          { title: "Selimut Kerucut", desc: "Sisi lengkung yang menghubungkan alas dengan titik puncak. Jika dibuka, akan berbentuk juring lingkaran.", icon: "🌙" },
          { title: "Jari-jari (r)", desc: "Jarak dari titik pusat alas ke tepi lingkaran alas.", icon: "📏" },
          { title: "Tinggi (t)", desc: "Jarak tegak lurus dari alas ke titik puncak kerucut.", icon: "📐" },
          { title: "Garis Pelukis (s)", desc: "Jarak dari tepi alas ke titik puncak kerucut. s = √(r² + t²)", icon: "📏" }
        ]
      case 'bola':
        return [
          { title: "Pusat Bola", desc: "Titik yang berada tepat di tengah bola, berjarak sama ke semua titik di permukaan.", icon: "🎯" },
          { title: "Jari-jari (r)", desc: "Jarak dari pusat bola ke sembarang titik di permukaan bola.", icon: "📏" },
          { title: "Diameter (d)", desc: "Jarak terpanjang antara dua titik di permukaan bola yang melalui pusat. d = 2r", icon: "📐" },
          { title: "Permukaan Bola", desc: "Seluruh sisi lengkung bola yang membentuk bidang sferis.", icon: "🌐" }
        ]
      default:
        return []
    }
  }

  const getDescription = (moduleSlug: string) => {
    switch (moduleSlug) {
      case 'tabung':
        return "Tabung adalah bangun ruang yang dibatasi oleh dua bidang lingkaran yang sejajar dan kongruen (sama bentuk dan ukuran) serta sebuah bidang lengkung yang disebut selimut tabung. Bayangkan sebuah kaleng susu atau gelas; itulah bentuk tabung dalam kehidupan sehari-hari."
      case 'kerucut':
        return "Kerucut adalah bangun ruang yang memiliki alas berbentuk lingkaran dan memiliki satu titik puncak. Bayangkan sebuah topi ulang tahun atau cone es krim; itulah bentuk kerucut dalam kehidupan sehari-hari."
      case 'bola':
        return "Bola adalah bangun ruang yang semua titik pada permukaannya berjarak sama dari pusat. Bayangkan sebuah bola sepak, bola basket, atau planet; itulah bentuk bola dalam kehidupan sehari-hari."
      default:
        return ""
    }
  }

  if (!conceptContent) {
    // Dynamic fallback content based on module
    const elements = getElementsContent(moduleSlug || 'tabung')

    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          🎯 Konsep dan Unsur-unsur {geometryInfo.name}
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Gunakan kontrol di sebelah kanan untuk mengubah parameter {geometryInfo.name.toLowerCase()} secara interaktif!
        </Alert>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {getDescription(moduleSlug || 'tabung')}
        </Typography>

        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" gutterBottom fontWeight="bold">
          🔍 Unsur-unsur Utama {geometryInfo.name}:
        </Typography>
        <Grid container spacing={3}>
          {elements.map((item) => (
            <Grid item xs={12} sm={6} key={item.title}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>{item.icon}</Avatar>
                  <Box>
                    <Typography variant="h6">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        {conceptContent.title}
      </Typography>
      <div dangerouslySetInnerHTML={{ __html: conceptContent.content }} />
      {conceptContent.elements?.map((element, index) => (
        <DynamicContentElement key={index} element={element} />
      ))}
    </Box>
  )
}

// Helper functions untuk jaring-jaring
const getNetDescription = (moduleSlug: string) => {
  switch (moduleSlug) {
    case 'tabung':
      return "Jika sebuah tabung kita potong pada beberapa rusuknya dan kita buka, maka akan terbentuk sebuah jaring-jaring tabung. Jaring-jaring ini memperlihatkan semua permukaan tabung dalam bentuk datar."
    case 'kerucut':
      return "Jika sebuah kerucut kita potong pada beberapa bagiannya dan kita buka, maka akan terbentuk sebuah jaring-jaring kerucut. Jaring-jaring ini memperlihatkan semua permukaan kerucut dalam bentuk datar."
    case 'bola':
      return "Bola tidak memiliki jaring-jaring dalam arti tradisional karena permukaannya adalah satu bidang lengkung kontinu. Namun, kita dapat memproyeksikan permukaan bola ke bidang datar dengan berbagai cara."
    default:
      return ""
  }
}

const getNetComponents = (moduleSlug: string) => {
  switch (moduleSlug) {
    case 'tabung':
      return (
        <>
          Seperti yang terlihat, jaring-jaring tabung terdiri dari:
          <ul>
            <li><b>Dua buah lingkaran</b> yang sama besar, berfungsi sebagai alas dan tutup.</li>
            <li><b>Satu buah persegi panjang</b> yang berfungsi sebagai selimut tabung. Panjang persegi panjang ini sama dengan keliling lingkaran alas, dan lebarnya sama dengan tinggi tabung.</li>
          </ul>
        </>
      )
    case 'kerucut':
      return (
        <>
          Seperti yang terlihat, jaring-jaring kerucut terdiri dari:
          <ul>
            <li><b>Satu buah lingkaran</b> yang berfungsi sebagai alas kerucut.</li>
            <li><b>Satu buah juring lingkaran</b> yang berfungsi sebagai selimut kerucut. Panjang busur juring ini sama dengan keliling lingkaran alas.</li>
          </ul>
        </>
      )
    case 'bola':
      return (
        <>
          Untuk visualisasi bola:
          <ul>
            <li><b>Proyeksi silindris</b> seperti peta dunia yang membentang dari kutub ke kutub.</li>
            <li><b>Proyeksi sferis</b> yang membagi bola menjadi bagian-bagian seperti kulit jeruk.</li>
          </ul>
        </>
      )
    default:
      return null
  }
}

// Function to render realistic 3D models based on real-world examples
function renderRealWorldModel(moduleSlug: string, exampleIndex: number, color: string) {
  // TABUNG Examples
  if (moduleSlug === 'tabung') {
    switch (exampleIndex) {
      case 0: // Kaleng Minuman
        return (
          <group>
            {/* Body kaleng */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.8, 0.8, 3, 32]} />
              <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Tutup atas */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.82, 0.82, 0.1, 32]} />
              <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Ring pull tab */}
            <mesh position={[0, 1.6, 0.3]} castShadow>
              <torusGeometry args={[0.15, 0.05, 16, 32]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )
      case 1: // Gelas / Mug
        return (
          <group>
            {/* Body gelas */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.9, 0.8, 2.5, 32]} />
              <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} />
            </mesh>
            {/* Handle/pegangan */}
            <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[0.5, 0.15, 16, 32, Math.PI]} />
              <meshStandardMaterial color={color} metalness={0.1} roughness={0.6} />
            </mesh>
          </group>
        )
      case 2: // Drum / Tangki
        return (
          <group>
            {/* Body drum */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.2, 3.5, 32]} />
              <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
            </mesh>
            {/* Ring penguat (3 buah) */}
            {[-1, 0, 1].map((y, i) => (
              <mesh key={i} position={[0, y * 1.2, 0]}>
                <torusGeometry args={[1.22, 0.08, 16, 32]} />
                <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )
      case 3: // Pipa / Tube
        return (
          <group rotation={[0, 0, Math.PI / 2]}>
            {/* Pipa horizontal panjang */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.5, 0.5, 5, 32]} />
              <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Joint/sambungan kiri */}
            <mesh position={[2.5, 0, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
              <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Joint/sambungan kanan */}
            <mesh position={[-2.5, 0, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} />
              <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )
    }
  }

  // KERUCUT Examples
  if (moduleSlug === 'kerucut') {
    switch (exampleIndex) {
      case 0: // Es Krim Cone
        return (
          <group>
            {/* Cone (kerucut terbalik) */}
            <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.8, 2.5, 32]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Es krim (bola) */}
            <mesh position={[0, 1.3, 0]} castShadow>
              <sphereGeometry args={[0.9, 32, 32]} />
              <meshStandardMaterial color="#FFF5E1" roughness={0.8} />
            </mesh>
            {/* Tekstur waffle pada cone */}
            <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.81, 2.51, 32]} />
              <meshStandardMaterial color="#8B4513" wireframe={true} opacity={0.3} transparent />
            </mesh>
          </group>
        )
      case 1: // Traffic Cone
        return (
          <group>
            {/* Base (alas persegi) */}
            <mesh position={[0, -1.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color="#222222" roughness={0.7} />
            </mesh>
            {/* Cone body */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[1, 3, 32]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* Reflective strips (putih) */}
            {[0.5, -0.5].map((y, i) => (
              <mesh key={i} position={[0, y, 0]}>
                <cylinderGeometry args={[0.7 - y * 0.2, 0.8 - y * 0.2, 0.3, 32]} />
                <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
              </mesh>
            ))}
          </group>
        )
      case 2: // Corong / Funnel
        return (
          <group>
            {/* Bagian atas (wide opening) */}
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <coneGeometry args={[1.5, 1.5, 32]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} side={2} />
            </mesh>
            {/* Tube bawah (spout) */}
            <mesh position={[0, -1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.2, 2, 32]} />
              <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
            </mesh>
          </group>
        )
      case 3: // Topi Ulang Tahun
        return (
          <group>
            {/* Cone topi */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[1.2, 3, 32]} />
              <meshStandardMaterial color={color} roughness={0.5} />
            </mesh>
            {/* Pom-pom di puncak */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color="#FFD700" roughness={0.7} />
            </mesh>
            {/* Spiral stripes */}
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0, 1 - i * 0.5, 0]} rotation={[0, i * Math.PI / 3, 0]}>
                <torusGeometry args={[1.1 - i * 0.2, 0.05, 8, 32]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            ))}
          </group>
        )
    }
  }

  // BOLA Examples
  if (moduleSlug === 'bola') {
    switch (exampleIndex) {
      case 0: // Bola Sepak / Basket
        return (
          <group>
            {/* Bola utama */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            {/* Garis-garis bola (pentagon pattern untuk sepak bola) */}
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0, 0, 0]} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
                <torusGeometry args={[1.51, 0.03, 8, 32, Math.PI / 2.5]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            ))}
          </group>
        )
      case 1: // Bola Lampu / Bulb
        return (
          <group>
            {/* Glass bulb */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1, 32, 32]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.7}
                metalness={0.1}
                roughness={0.1}
                emissive={color}
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Filament (pusat) */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={2} />
            </mesh>
            {/* Base/socket */}
            <mesh position={[0, -0.8, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.5, 0.8, 32]} />
              <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )
      case 2: // Globe / Bola Dunia
        return (
          <group>
            {/* Bola dunia */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial color={color} roughness={0.6} />
            </mesh>
            {/* Garis equator */}
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.51, 0.03, 8, 64]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            {/* Garis meridian */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
                <torusGeometry args={[1.51, 0.03, 8, 64]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
            ))}
            {/* Stand */}
            <mesh position={[0, -2, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.6, 0.3, 32]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
            {/* Arc stand */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[1.6, 0.08, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
          </group>
        )
      case 3: // Tangki Bola Gas
        return (
          <group>
            {/* Main sphere tank */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Support legs (4 buah) */}
            {[0, 1, 2, 3].map((i) => {
              const angle = (i * Math.PI * 2) / 4
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * 1.2, -1.2, Math.sin(angle) * 1.2]}
                  rotation={[Math.PI / 6, 0, 0]}
                  castShadow
                >
                  <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
                  <meshStandardMaterial color="#333333" metalness={0.7} roughness={0.3} />
                </mesh>
              )
            })}
            {/* Pressure gauge */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
              <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Valve on top */}
            <mesh position={[0, 1.7, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
              <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )
    }
  }

  // Default fallback
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

// Implementation Lesson Component
const ImplementationLesson: React.FC = () => {
  const { moduleSlug } = useParams()
  const [selectedExample, setSelectedExample] = useState(0)

  // Data implementasi untuk setiap modul
  const getImplementationData = (moduleSlug: string) => {
    switch (moduleSlug) {
      case 'tabung':
        return {
          title: 'Implementasi Tabung di Kehidupan Sehari-hari',
          description: 'Bentuk tabung sangat umum ditemukan dalam kehidupan sehari-hari. Berikut adalah beberapa contoh penerapan tabung yang sering kita jumpai:',
          examples: [
            {
              name: 'Kaleng Minuman',
              image: '/images/real-world/kaleng.jpg',
              description: 'Kaleng minuman soft drink atau jus menggunakan bentuk tabung karena efisien dalam penyimpanan, mudah digenggam, dan optimal untuk distribusi tekanan internal dari cairan berkarbonasi.',
              specs: { radius: '3.2 cm', height: '12.3 cm', volume: '≈ 396 ml' },
              color: '#FF6B6B'
            },
            {
              name: 'Gelas / Mug',
              image: '/images/real-world/gelas.jpg',
              description: 'Gelas dan mug berbentuk tabung memudahkan untuk digenggam dan minum. Bentuk ini juga memaksimalkan volume isi dengan material yang minimal.',
              specs: { radius: '3.5 cm', height: '10 cm', volume: '≈ 385 ml' },
              color: '#4ECDC4'
            },
            {
              name: 'Drum / Tangki',
              image: '/images/real-world/drum.jpg',
              description: 'Drum atau tangki penyimpanan menggunakan bentuk tabung karena dapat menahan tekanan dengan baik dan memiliki struktur yang kuat dengan material minimal.',
              specs: { radius: '28 cm', height: '85 cm', volume: '≈ 209 L' },
              color: '#95E1D3'
            },
            {
              name: 'Pipa / Tube',
              image: '/images/real-world/pipa.jpg',
              description: 'Pipa air, pipa gas, dan sistem perpipaan menggunakan bentuk tabung untuk mengalirkan fluida dengan efisien dan tahan tekanan.',
              specs: { radius: '2.5 cm', height: '100 cm', volume: '≈ 1.96 L' },
              color: '#F38181'
            }
          ]
        }
      case 'kerucut':
        return {
          title: 'Implementasi Kerucut di Kehidupan Sehari-hari',
          description: 'Bentuk kerucut memiliki keunikan dengan titik puncaknya yang membuatnya ideal untuk berbagai fungsi praktis:',
          examples: [
            {
              name: 'Es Krim Cone',
              image: '/images/real-world/cone-icecream.jpg',
              description: 'Cone es krim berbentuk kerucut terbalik memudahkan untuk dipegang dan dimakan. Desain ini juga mencegah tumpahan es krim dan memberikan pengalaman makan yang praktis.',
              specs: { radius: '3 cm', height: '12 cm', volume: '≈ 113 ml' },
              color: '#FFB6B9'
            },
            {
              name: 'Traffic Cone',
              image: '/images/real-world/traffic-cone.jpg',
              description: 'Kerucut lalu lintas menggunakan bentuk ini karena mudah terlihat, stabil saat ditempatkan, dan dapat ditumpuk untuk penyimpanan yang efisien.',
              specs: { radius: '20 cm', height: '70 cm', volume: '≈ 29.3 L' },
              color: '#FFA07A'
            },
            {
              name: 'Corong / Funnel',
              image: '/images/real-world/funnel.jpg',
              description: 'Corong memanfaatkan bentuk kerucut untuk mengarahkan cairan atau material dari area luas ke lubang kecil dengan efisien tanpa tumpah.',
              specs: { radius: '8 cm', height: '15 cm', volume: '≈ 1 L' },
              color: '#87CEEB'
            },
            {
              name: 'Topi Ulang Tahun',
              image: '/images/real-world/party-hat.jpg',
              description: 'Topi pesta berbentuk kerucut memberikan tampilan festive dan mudah dipasang di kepala dengan elastic band.',
              specs: { radius: '7 cm', height: '20 cm', volume: '≈ 1.03 L' },
              color: '#DDA0DD'
            }
          ]
        }
      case 'bola':
        return {
          title: 'Implementasi Bola di Kehidupan Sehari-hari',
          description: 'Bentuk bola atau sferis adalah bentuk paling simetris dan efisien dalam geometri, banyak digunakan karena sifat uniknya:',
          examples: [
            {
              name: 'Bola Sepak / Basket',
              image: '/images/real-world/ball-sports.jpg',
              description: 'Bola olahraga berbentuk sferis sempurna agar dapat menggelinding dan memantul dengan prediktabel ke segala arah. Bentuk ini juga optimal untuk aerodinamika.',
              specs: { radius: '11 cm', volume: '≈ 5.6 L' },
              color: '#FF8C42'
            },
            {
              name: 'Bola Lampu / Bulb',
              image: '/images/real-world/lightbulb.jpg',
              description: 'Bagian kaca bola lampu berbentuk sferis untuk mendistribusikan cahaya secara merata ke segala arah.',
              specs: { radius: '3 cm', volume: '≈ 113 ml' },
              color: '#FFD93D'
            },
            {
              name: 'Globe / Bola Dunia',
              image: '/images/real-world/globe.jpg',
              description: 'Globe merepresentasikan bumi dalam bentuk miniatur sferis karena planet bumi sendiri berbentuk sferis (geoid) akibat gravitasi.',
              specs: { radius: '15 cm', volume: '≈ 14.1 L' },
              color: '#6BCB77'
            },
            {
              name: 'Tangki Bola Gas',
              image: '/images/real-world/sphere-tank.jpg',
              description: 'Tangki penyimpanan gas berbentuk bola karena dapat menahan tekanan tinggi dengan distribusi stress yang merata pada seluruh permukaan.',
              specs: { radius: '50 cm', volume: '≈ 523.6 L' },
              color: '#4D96FF'
            }
          ]
        }
      default:
        return null
    }
  }

  const implementationData = getImplementationData(moduleSlug || 'tabung')

  if (!implementationData) return null

  const currentExample = implementationData.examples[selectedExample]

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="secondary.main">
        🌍 {implementationData.title}
      </Typography>
      <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
        {implementationData.description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        {/* Daftar Contoh */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Pilih Contoh:
          </Typography>
          <Stack spacing={2}>
            {implementationData.examples.map((example, index) => (
              <Card
                key={index}
                sx={{
                  cursor: 'pointer',
                  border: selectedExample === index ? '3px solid' : '1px solid',
                  borderColor: selectedExample === index ? 'primary.main' : 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 3
                  },
                  bgcolor: selectedExample === index ? 'primary.50' : 'white'
                }}
                onClick={() => setSelectedExample(index)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: example.color, width: 48, height: 48 }}>
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {example.name}
                      </Typography>
                      {selectedExample === index && (
                        <Chip label="Terpilih" size="small" color="primary" sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>

        {/* Detail Contoh & Model 3D */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                {currentExample.name}
              </Typography>

              {/* Model 3D Interactive */}
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Suspense fallback={<CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />}>
                  <Canvas shadows camera={{ position: [8, 6, 10], fov: 50 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                    <Environment preset="sunset" />

                    {/* Render geometry sesuai contoh yang dipilih */}
                    {renderRealWorldModel(moduleSlug || 'tabung', selectedExample, currentExample.color)}

                    <ContactShadows opacity={0.5} scale={8} blur={1} far={10} resolution={256} color="#000000" />
                    <OrbitControls enableZoom={true} minDistance={3} maxDistance={15} />
                  </Canvas>
                </Suspense>

                <Alert
                  severity="info"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'auto',
                    maxWidth: '90%'
                  }}
                >
                  🖱️ Klik dan drag untuk memutar model 3D
                </Alert>
              </Box>

              {/* Deskripsi */}
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                {currentExample.description}
              </Typography>

              {/* Spesifikasi */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary">
                  📊 Spesifikasi Tipikal:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(currentExample.specs).map(([key, value]) => (
                    <Grid item xs={12} sm={4} key={key}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                          {key === 'radius' ? 'Jari-jari' : key === 'height' ? 'Tinggi' : 'Volume'}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mt: 3 }}>
        💡 <strong>Tahukah kamu?</strong> Bentuk geometri yang kamu pelajari ini dipilih karena sifat-sifat matematisnya yang optimal untuk fungsi tertentu dalam kehidupan nyata!
      </Alert>
    </Box>
  )
}

const NetLesson: React.FC = () => {
  const { currentLesson, showNetAnimation, toggleNetAnimation } = useLearningStore()
  const { moduleSlug } = useParams()
  const netContent = currentLesson?.content?.net

  if (!netContent) {
    // Fallback content
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="secondary.dark">
          🔄 Jaring-jaring {getGeometryInfo(moduleSlug || 'tabung').name}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {getNetDescription(moduleSlug || 'tabung')}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {getNetComponents(moduleSlug || 'tabung')}
        </Typography>

        <Alert severity="info" sx={{ my: 3 }}>
          💡 Aktifkan toggle "Tampilkan Jaring-jaring" di panel kontrol untuk melihat visualisasi jaring-jaring dengan mode 2D/3D!
        </Alert>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          {!showNetAnimation && (
            <Button
              variant="contained"
              onClick={toggleNetAnimation}
              size="large"
              color="primary"
            >
              Tampilkan Jaring-Jaring Sekarang
            </Button>
          )}
          {showNetAnimation && (
            <Alert severity="success" sx={{ maxWidth: 600, mx: 'auto' }}>
              ✅ Jaring-jaring sedang ditampilkan di canvas utama. Anda bisa beralih antara mode 2D dan 3D menggunakan toggle di visualisasi.
            </Alert>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="secondary.dark">
        {netContent.title}
      </Typography>
      <div dangerouslySetInnerHTML={{ __html: netContent.content }} />
      {netContent.elements?.map((element, index) => (
        <DynamicContentElement key={index} element={element} />
      ))}

      <Alert severity="info" sx={{ my: 3 }}>
        💡 Aktifkan toggle "Tampilkan Jaring-jaring" di panel kontrol untuk melihat visualisasi jaring-jaring dengan mode 2D/3D!
      </Alert>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        {!showNetAnimation && (
          <Button
            variant="contained"
            onClick={toggleNetAnimation}
            size="large"
            color="primary"
          >
            Tampilkan Jaring-Jaring Sekarang
          </Button>
        )}
        {showNetAnimation && (
          <Alert severity="success" sx={{ maxWidth: 600, mx: 'auto' }}>
            ✅ Jaring-jaring sedang ditampilkan di canvas utama. Anda bisa beralih antara mode 2D dan 3D menggunakan toggle di visualisasi.
          </Alert>
        )}
      </Box>
    </Box>
  )
}

const FormulaLesson: React.FC = () => {
  const { currentLesson, geometryParams } = useLearningStore()
  const { moduleSlug } = useParams()
  const geometryInfo = getGeometryInfo(moduleSlug || 'tabung')
  const formulaContent = currentLesson?.content?.formula
  const volume = calculateVolumeByType(moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)
  const surfaceArea = calculateSurfaceAreaByType(moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)

  const getFormulaExplanation = (moduleSlug: string) => {
    switch (moduleSlug) {
      case 'tabung':
        return {
          volumeExplanation: "Prinsip volume untuk bangun ruang seperti tabung (dan prisma) adalah Luas Alas × Tinggi. Luas Alas (Lingkaran) = πr², maka Volume = (πr²) × t",
          surfaceExplanation: "Luas permukaan adalah total luas dari semua sisi pada jaring-jaringnya. Luas = (2 × Luas Alas) + Luas Selimut = (2 × πr²) + (2πr × t)"
        }
      case 'kerucut':
        return {
          volumeExplanation: "Volume kerucut adalah sepertiga dari volume tabung dengan alas dan tinggi yang sama. Karena volume tabung = πr²t, maka volume kerucut = ⅓ × πr²t",
          surfaceExplanation: "Luas permukaan terdiri dari luas alas dan luas selimut. Luas = Luas Alas + Luas Selimut = πr² + πrs = πr(r + s), dimana s adalah garis pelukis"
        }
      case 'bola':
        return {
          volumeExplanation: "Volume bola dihitung menggunakan rumus V = ⁴⁄₃πr³, dimana r adalah jari-jari bola. Formula ini diturunkan dari integral kalkulus.",
          surfaceExplanation: "Luas permukaan bola adalah empat kali luas lingkaran dengan jari-jari yang sama. Karena luas lingkaran = πr², maka luas permukaan bola = 4 × πr² = 4πr²"
        }
      default:
        return {
          volumeExplanation: "",
          surfaceExplanation: ""
        }
    }
  }

  // Helper function untuk membuat penjelasan langkah demi langkah
  const getStepByStepCalculation = (type: 'volume' | 'surfaceArea', moduleSlug: string, r: number, t: number) => {
    const pi = Math.PI

    if (type === 'volume') {
      switch (moduleSlug) {
        case 'tabung':
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` },
              { label: 't (tinggi)', value: `${t.toFixed(1)} cm` }
            ],
            ditanyakan: 'V (Volume) = ?',
            rumus: 'V = π × r² × t',
            penyelesaian: [
              `V = π × r² × t`,
              `V = π × ${r.toFixed(1)}² × ${t.toFixed(1)}`,
              `V = π × ${(r * r).toFixed(2)} × ${t.toFixed(1)}`,
              `V = ${(pi * r * r * t).toFixed(2)} cm³`
            ],
            hasil: `${volume.toFixed(2)} cm³`
          }
        case 'kerucut':
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` },
              { label: 't (tinggi)', value: `${t.toFixed(1)} cm` }
            ],
            ditanyakan: 'V (Volume) = ?',
            rumus: 'V = ⅓ × π × r² × t',
            penyelesaian: [
              `V = ⅓ × π × r² × t`,
              `V = ⅓ × π × ${r.toFixed(1)}² × ${t.toFixed(1)}`,
              `V = ⅓ × π × ${(r * r).toFixed(2)} × ${t.toFixed(1)}`,
              `V = ⅓ × ${(pi * r * r * t).toFixed(2)}`,
              `V = ${volume.toFixed(2)} cm³`
            ],
            hasil: `${volume.toFixed(2)} cm³`
          }
        case 'bola':
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` }
            ],
            ditanyakan: 'V (Volume) = ?',
            rumus: 'V = ⁴⁄₃ × π × r³',
            penyelesaian: [
              `V = ⁴⁄₃ × π × r³`,
              `V = ⁴⁄₃ × π × ${r.toFixed(1)}³`,
              `V = ⁴⁄₃ × π × ${(r * r * r).toFixed(2)}`,
              `V = ⁴⁄₃ × ${(pi * r * r * r).toFixed(2)}`,
              `V = ${volume.toFixed(2)} cm³`
            ],
            hasil: `${volume.toFixed(2)} cm³`
          }
        default:
          return null
      }
    } else {
      // Surface Area
      switch (moduleSlug) {
        case 'tabung':
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` },
              { label: 't (tinggi)', value: `${t.toFixed(1)} cm` }
            ],
            ditanyakan: 'L (Luas Permukaan) = ?',
            rumus: 'L = 2 × π × r × (r + t)',
            penyelesaian: [
              `L = 2 × π × r × (r + t)`,
              `L = 2 × π × ${r.toFixed(1)} × (${r.toFixed(1)} + ${t.toFixed(1)})`,
              `L = 2 × π × ${r.toFixed(1)} × ${(r + t).toFixed(1)}`,
              `L = ${(2 * pi * r * (r + t)).toFixed(2)} cm²`
            ],
            hasil: `${surfaceArea.toFixed(2)} cm²`
          }
        case 'kerucut':
          const s = Math.sqrt(r * r + t * t)
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` },
              { label: 't (tinggi)', value: `${t.toFixed(1)} cm` },
              { label: 's (garis pelukis)', value: `√(r² + t²) = ${s.toFixed(2)} cm` }
            ],
            ditanyakan: 'L (Luas Permukaan) = ?',
            rumus: 'L = π × r × (r + s)',
            penyelesaian: [
              `L = π × r × (r + s)`,
              `L = π × ${r.toFixed(1)} × (${r.toFixed(1)} + ${s.toFixed(2)})`,
              `L = π × ${r.toFixed(1)} × ${(r + s).toFixed(2)}`,
              `L = ${surfaceArea.toFixed(2)} cm²`
            ],
            hasil: `${surfaceArea.toFixed(2)} cm²`
          }
        case 'bola':
          return {
            diketahui: [
              { label: 'r (jari-jari)', value: `${r.toFixed(1)} cm` }
            ],
            ditanyakan: 'L (Luas Permukaan) = ?',
            rumus: 'L = 4 × π × r²',
            penyelesaian: [
              `L = 4 × π × r²`,
              `L = 4 × π × ${r.toFixed(1)}²`,
              `L = 4 × π × ${(r * r).toFixed(2)}`,
              `L = ${surfaceArea.toFixed(2)} cm²`
            ],
            hasil: `${surfaceArea.toFixed(2)} cm²`
          }
        default:
          return null
      }
    }
  }

  if (!formulaContent) {
    // Dynamic fallback content based on module
    const explanation = getFormulaExplanation(moduleSlug || 'tabung')
    const volumeSteps = getStepByStepCalculation('volume', moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)
    const surfaceSteps = getStepByStepCalculation('surfaceArea', moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)

    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="success.dark">
          🧮 Penemuan Rumus {geometryInfo.name}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Dengan memahami jaring-jaring {geometryInfo.name.toLowerCase()}, kita bisa dengan mudah menurunkan rumus untuk menghitung luas permukaan dan volumenya.
        </Typography>

        <Alert severity="info" sx={{ my: 3 }}>
          📊 Contoh perhitungan di bawah ini menggunakan nilai parameter yang sedang aktif. Ubah nilai jari-jari (r) dan tinggi (t) menggunakan slider untuk melihat perhitungan berubah secara otomatis!
        </Alert>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Luas Permukaan */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderLeft: '6px solid',
                borderColor: 'warning.main',
                bgcolor: 'warning.50',
                height: '100%'
              }}
            >
              <Typography variant="h5" color="warning.dark" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📐 Contoh Soal Luas Permukaan {geometryInfo.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {surfaceSteps && (
                <>
                  {/* Diketahui */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Diketahui:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {surfaceSteps.diketahui.map((item, idx) => (
                        <Typography key={idx} variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                          {item.label} = {item.value}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Ditanyakan */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Ditanyakan:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem', pl: 2 }}>
                      {surfaceSteps.ditanyakan}
                    </Typography>
                  </Box>

                  {/* Penyelesaian */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Penyelesaian:
                    </Typography>
                    <Box sx={{ pl: 2, bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                      {surfaceSteps.penyelesaian.map((step, idx) => (
                        <Typography
                          key={idx}
                          variant="body1"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            mb: idx < surfaceSteps.penyelesaian.length - 1 ? 1 : 0,
                            fontWeight: idx === surfaceSteps.penyelesaian.length - 1 ? 'bold' : 'normal'
                          }}
                        >
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Hasil */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'warning.main',
                      color: 'white',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      L = {surfaceSteps.hasil}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Volume */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderLeft: '6px solid',
                borderColor: 'info.main',
                bgcolor: 'info.50',
                height: '100%'
              }}
            >
              <Typography variant="h5" color="info.dark" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📦 Contoh Soal Volume {geometryInfo.name}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {volumeSteps && (
                <>
                  {/* Diketahui */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Diketahui:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {volumeSteps.diketahui.map((item, idx) => (
                        <Typography key={idx} variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                          {item.label} = {item.value}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Ditanyakan */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Ditanyakan:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem', pl: 2 }}>
                      {volumeSteps.ditanyakan}
                    </Typography>
                  </Box>

                  {/* Penyelesaian */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                      Penyelesaian:
                    </Typography>
                    <Box sx={{ pl: 2, bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                      {volumeSteps.penyelesaian.map((step, idx) => (
                        <Typography
                          key={idx}
                          variant="body1"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            mb: idx < volumeSteps.penyelesaian.length - 1 ? 1 : 0,
                            fontWeight: idx === volumeSteps.penyelesaian.length - 1 ? 'bold' : 'normal'
                          }}
                        >
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Hasil */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'info.main',
                      color: 'white',
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      V = {volumeSteps.hasil}
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Penjelasan Konsep */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            💡 Penjelasan Konsep Rumus
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" color="warning.dark" fontWeight="bold" gutterBottom>
                  Luas Permukaan {geometryInfo.name}
                </Typography>
                <Typography paragraph sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {explanation.surfaceExplanation}
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {geometryInfo.surfaceFormula}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" color="info.dark" fontWeight="bold" gutterBottom>
                  Volume {geometryInfo.name}
                </Typography>
                <Typography paragraph sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {explanation.volumeExplanation}
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                    {geometryInfo.volumeFormula}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    )
  }

  // If formulaContent exists from database, also show step-by-step calculations
  const volumeSteps = getStepByStepCalculation('volume', moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)
  const surfaceSteps = getStepByStepCalculation('surfaceArea', moduleSlug || 'tabung', geometryParams.radius, geometryParams.height)

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="success.dark">
        {formulaContent.title}
      </Typography>
      <div dangerouslySetInnerHTML={{ __html: formulaContent.content }} />
      {formulaContent.elements?.map((element, index) => (
        <DynamicContentElement key={index} element={element} />
      ))}

      <Alert severity="info" sx={{ my: 3 }}>
        📊 Contoh perhitungan di bawah ini menggunakan nilai parameter yang sedang aktif. Ubah nilai jari-jari (r) dan tinggi (t) menggunakan slider untuk melihat perhitungan berubah secara otomatis!
      </Alert>

      {/* Always show live formula calculations with step-by-step */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Luas Permukaan */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: '6px solid',
              borderColor: 'warning.main',
              bgcolor: 'warning.50',
              height: '100%'
            }}
          >
            <Typography variant="h5" color="warning.dark" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📐 Contoh Soal Luas Permukaan {geometryInfo.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {surfaceSteps && (
              <>
                {/* Diketahui */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Diketahui:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {surfaceSteps.diketahui.map((item, idx) => (
                      <Typography key={idx} variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                        {item.label} = {item.value}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Ditanyakan */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Ditanyakan:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem', pl: 2 }}>
                    {surfaceSteps.ditanyakan}
                  </Typography>
                </Box>

                {/* Penyelesaian */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Penyelesaian:
                  </Typography>
                  <Box sx={{ pl: 2, bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                    {surfaceSteps.penyelesaian.map((step, idx) => (
                      <Typography
                        key={idx}
                        variant="body1"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          mb: idx < surfaceSteps.penyelesaian.length - 1 ? 1 : 0,
                          fontWeight: idx === surfaceSteps.penyelesaian.length - 1 ? 'bold' : 'normal'
                        }}
                      >
                        {step}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Hasil */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'warning.main',
                    color: 'white',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    L = {surfaceSteps.hasil}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Volume */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: '6px solid',
              borderColor: 'info.main',
              bgcolor: 'info.50',
              height: '100%'
            }}
          >
            <Typography variant="h5" color="info.dark" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              📦 Contoh Soal Volume {geometryInfo.name}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {volumeSteps && (
              <>
                {/* Diketahui */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Diketahui:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {volumeSteps.diketahui.map((item, idx) => (
                      <Typography key={idx} variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                        {item.label} = {item.value}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Ditanyakan */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Ditanyakan:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1rem', pl: 2 }}>
                    {volumeSteps.ditanyakan}
                  </Typography>
                </Box>

                {/* Penyelesaian */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom>
                    Penyelesaian:
                  </Typography>
                  <Box sx={{ pl: 2, bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                    {volumeSteps.penyelesaian.map((step, idx) => (
                      <Typography
                        key={idx}
                        variant="body1"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.95rem',
                          mb: idx < volumeSteps.penyelesaian.length - 1 ? 1 : 0,
                          fontWeight: idx === volumeSteps.penyelesaian.length - 1 ? 'bold' : 'normal'
                        }}
                      >
                        {step}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                {/* Hasil */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'info.main',
                    color: 'white',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    V = {volumeSteps.hasil}
                  </Typography>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

const QuizLesson: React.FC = () => {
  const { currentLesson, completeLesson, currentModule } = useLearningStore()

  // Note: We no longer strictly require `currentLesson` to be set for the quiz tab 
  // because we are fetching by module ID. However, `currentLesson` logic in handleTabChange
  // is still useful for tracking state.

  const handleQuizComplete = (score: number, maxScore: number) => {
    // If we have a currentLesson (e.g. from fallback or if one was found), complete it.
    // If not, we might be in a "module-wide quiz" mode where we just award XP without completing a specific lesson.
    // Ideally we should try to complete the lesson that corresponds to the quiz if known.
    if (currentLesson) {
      completeLesson(currentLesson.id, score)
    }
  }

  return (
    <QuizSection
      moduleId={currentModule?.id}
      moduleSlug={currentModule?.slug}
      lessonId={currentLesson?.id}
      onComplete={handleQuizComplete}
    />
  )
}

const AssignmentLesson: React.FC = () => {
  const { currentLesson, currentModule } = useLearningStore()

  if (!currentLesson) {
    return (
      <Box>
        <Alert severity="info">
          Pilih lesson terlebih dahulu untuk melihat latihan
        </Alert>
      </Box>
    )
  }

  return <AssignmentSection lessonId={currentLesson.id} moduleId={currentModule?.id} />
}