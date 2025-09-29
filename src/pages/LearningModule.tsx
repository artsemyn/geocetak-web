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
  Paper
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
  TuneRounded
} from '@mui/icons-material'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useLearningStore } from '../stores/learningStore'
import { AssessmentHistory } from '../components/ai/AssessmentHistory'
import { ContentElement } from '../types'

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

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow scale={[scale, scale, scale]}>
      <coneGeometry
        args={[geometryParams.radius, geometryParams.height, 32]}
      />
      <meshStandardMaterial
        color="#f39c12"
        metalness={0.2}
        roughness={0.4}
        transparent={false}
        opacity={1}
      />
    </mesh>
  )
}

function InteractiveSphere() {
  const { geometryParams } = useLearningStore()
  const scale = 0.3

  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow scale={[scale, scale, scale]}>
      <sphereGeometry
        args={[geometryParams.radius, 32, 32]}
      />
      <meshStandardMaterial
        color="#e74c3c"
        metalness={0.2}
        roughness={0.4}
        transparent={false}
        opacity={1}
      />
    </mesh>
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

// Helper functions untuk perhitungan berdasarkan tipe modul
const calculateVolumeByType = (moduleSlug: string, radius: number, height: number) => {
  switch (moduleSlug) {
    case 'tabung':
      return Math.PI * radius * radius * height
    case 'kerucut':
      return (1/3) * Math.PI * radius * radius * height
    case 'bola':
      return (4/3) * Math.PI * Math.pow(radius, 3)
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
    fetchModules
  } = useLearningStore()

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
  }

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
    id: 1,
    name: geometryInfo.name,
    slug: moduleSlug || 'tabung',
    description: `Mempelajari bentuk geometri ${geometryInfo.name.toLowerCase()}`,
    icon_url: null,
    order_index: 1,
    is_published: true,
    xp_reward: 100,
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
          {geometryInfo.emoji} Modul Pembelajaran: {displayModule.name}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Kolom Kiri: Viewport 3D */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ height: 500, position: 'relative', background: '#f0f4f8', borderRadius: 2 }}>
                <Suspense fallback={<CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%' }} />}>
                  <Canvas shadows camera={{ position: [8, 6, 10], fov: 50 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                    <Environment preset="studio" />
                    {showNetAnimation ? <CylinderNet /> : getGeometryComponent(moduleSlug || 'tabung')}
                    <ContactShadows opacity={0.5} scale={8} blur={1} far={10} resolution={256} color="#000000" />
                    <OrbitControls minDistance={2} maxDistance={25} />
                  </Canvas>
                </Suspense>
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
                <FormControlLabel
                  control={<Switch checked={showNetAnimation} onChange={toggleNetAnimation} />}
                  label="Tampilkan Jaring-jaring"
                />
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
                <Tab icon={<MenuBookRounded />} label="Konsep" />
                <Tab icon={<Settings />} label="Jaring-jaring" />
                <Tab icon={<Calculate />} label="Rumus" />
                <Tab icon={<Quiz />} label="Quiz" />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}><ConceptLesson /></TabPanel>
            <TabPanel value={tabValue} index={1}><NetLesson /></TabPanel>
            <TabPanel value={tabValue} index={2}><FormulaLesson /></TabPanel>
            <TabPanel value={tabValue} index={3}><QuizLesson /></TabPanel>
          </Card>
        </Grid>
      </Grid>
    </Container>
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
  const conceptContent = currentLesson?.content_data?.concept

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

const NetLesson: React.FC = () => {
  const { currentLesson, showNetAnimation, toggleNetAnimation } = useLearningStore()
  const { moduleSlug } = useParams()
  const netContent = currentLesson?.content_data?.net

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
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={toggleNetAnimation}
            size="large"
            color={showNetAnimation ? "secondary" : "primary"}
          >
            {showNetAnimation ? `Kembalikan ke Bentuk ${getGeometryInfo(moduleSlug || 'tabung').name}` : 'Lihat Jaring-Jaring 3D'}
          </Button>
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
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="contained"
          onClick={toggleNetAnimation}
          size="large"
          color={showNetAnimation ? "secondary" : "primary"}
        >
          {showNetAnimation ? `Kembalikan ke Bentuk ${getGeometryInfo(moduleSlug || 'tabung').name}` : 'Lihat Jaring-Jaring 3D'}
        </Button>
      </Box>
    </Box>
  )
}

const FormulaLesson: React.FC = () => {
  const { currentLesson, geometryParams } = useLearningStore()
  const { moduleSlug } = useParams()
  const geometryInfo = getGeometryInfo(moduleSlug || 'tabung')
  const formulaContent = currentLesson?.content_data?.formula
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

  if (!formulaContent) {
    // Dynamic fallback content based on module
    const explanation = getFormulaExplanation(moduleSlug || 'tabung')

    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="success.dark">
          🧮 Penemuan Rumus {geometryInfo.name}
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Dengan memahami jaring-jaring {geometryInfo.name.toLowerCase()}, kita bisa dengan mudah menurunkan rumus untuk menghitung luas permukaan dan volumenya.
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderColor: 'primary.main', height: '100%' }}>
              <Typography variant="h5" color="primary.dark" fontWeight="bold" gutterBottom>Volume {geometryInfo.name}</Typography>
              <Typography paragraph>{explanation.volumeExplanation}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" align="center" sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                {geometryInfo.volumeFormula}
              </Typography>
              <Typography align="center" sx={{ mt: 2 }}>
                Hasil: <strong>{volume.toFixed(2)} unit³</strong>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, borderColor: 'secondary.main', height: '100%' }}>
              <Typography variant="h5" color="secondary.dark" fontWeight="bold" gutterBottom>Luas Permukaan {geometryInfo.name}</Typography>
              <Typography paragraph>{explanation.surfaceExplanation}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" align="center" sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
                {geometryInfo.surfaceFormula}
              </Typography>
              <Typography align="center" sx={{ mt: 2 }}>
                Hasil: <strong>{surfaceArea.toFixed(2)} unit²</strong>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="success.dark">
        {formulaContent.title}
      </Typography>
      <div dangerouslySetInnerHTML={{ __html: formulaContent.content }} />
      {formulaContent.elements?.map((element, index) => (
        <DynamicContentElement key={index} element={element} />
      ))}

      {/* Always show live formula calculations */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'primary.main', height: '100%' }}>
            <Typography variant="h5" color="primary.dark" fontWeight="bold" gutterBottom>Volume Real-time</Typography>
            <Typography variant="h6" align="center" sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
              {geometryInfo.volumeFormula} = {volume.toFixed(2)} unit³
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderColor: 'secondary.main', height: '100%' }}>
            <Typography variant="h5" color="secondary.dark" fontWeight="bold" gutterBottom>Luas Permukaan Real-time</Typography>
            <Typography variant="h6" align="center" sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2 }}>
              {geometryInfo.surfaceFormula} = {surfaceArea.toFixed(2)} unit²
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

const QuizLesson: React.FC = () => {
  const { currentLesson } = useLearningStore()
  const quizContent = currentLesson?.content?.quiz

  if (!quizContent) {
    // Fallback content
    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="warning.dark">
          📝 Quiz dan Latihan
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Fitur quiz interaktif sedang dalam pengembangan. Untuk sekarang, gunakan kontrol 3D untuk bereksperimen dengan parameter tabung.
        </Alert>
        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Contoh soal latihan:
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Soal 1:</Typography>
          <Typography paragraph>
            Sebuah tabung memiliki jari-jari 7 cm dan tinggi 10 cm. Hitunglah:
          </Typography>
          <Typography component="div">
            <ul>
              <li>a) Luas permukaan tabung</li>
              <li>b) Volume tabung</li>
            </ul>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            💡 Gunakan kontrol di atas untuk mengatur parameter r=7 dan t=10, lalu lihat hasilnya!
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="warning.dark">
        {quizContent.title}
      </Typography>
      <div dangerouslySetInnerHTML={{ __html: quizContent.content }} />
      {quizContent.elements?.map((element, index) => (
        <DynamicContentElement key={index} element={element} />
      ))}
    </Box>
  )
}