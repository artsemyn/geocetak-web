// src/pages/ThreeEditor.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  Download,
  Save,
  Info,
  Build,
  ViewInAr,
  Help,
  Refresh,
  Fullscreen,
  Close,
  OpenInNew,
  HelpOutline,
  Link as LinkIcon,
  CloudUpload,
  AttachFile
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useLearningStore } from '../stores/learningStore'
import ModelExportService from '../services/modelExportService'
import Navbar from '../components/Navbar'

export default function ThreeEditor() {
  const navigate = useNavigate()
  const { user, student } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [exportName, setExportName] = useState('')
  const [exporting, setExporting] = useState(false)
  const [userStats, setUserStats] = useState({ totalModels: 0, totalDownloads: 0, publicModels: 0 })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')

  // Load user model statistics
  useEffect(() => {
    if (user) {
      ModelExportService.getUserModelStats(user.id).then(stats => {
        setUserStats(stats)
      })
    }
  }, [user])

  // Check if iframe loads successfully
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Listen for iframe load events
    const handleIframeLoad = () => {
      setLoading(false)
      setBlocked(false)
    }

    const handleIframeError = () => {
      setLoading(false)
      setBlocked(true)
    }

    return () => clearTimeout(timer)
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setFileError('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.stl')) {
      setFileError('File harus berformat .stl')
      setSelectedFile(null)
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      setFileError('Ukuran file maksimal 50MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleSaveProject = async () => {
    if (!exportName.trim()) {
      return
    }

    if (!selectedFile) {
      setFileError('Silakan pilih file STL terlebih dahulu')
      return
    }

    setExporting(true)
    try {
      // Save model to database with file upload
      const result = await ModelExportService.saveModelExport({
        projectName: exportName,
        modelType: 'tinkercad',
        description: `3D model created with Tinkercad: ${exportName}`,
        geometryParams: {
          createdWith: 'tinkercad',
          timestamp: new Date().toISOString(),
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        },
        tags: ['tinkercad', 'custom', 'geometry'],
        isPublic: false,
        stlFile: selectedFile  // Pass the actual file
      })

      if (result) {
        console.log('✅ Project saved successfully:', result)

        // Update user stats
        const newStats = await ModelExportService.getUserModelStats(user!.id)
        setUserStats(newStats)

        // Show success and close dialog
        setSaveDialogOpen(false)
        setExportName('')
        setSelectedFile(null)
        setFileError('')

        // Show success message
        alert('🎉 Model berhasil disimpan! File STL telah diupload dan tersedia untuk diunduh.')
      } else {
        alert('❌ Gagal menyimpan model. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('❌ Terjadi kesalahan saat menyimpan model.')
    } finally {
      setExporting(false)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleFullscreen = () => {
    const iframe = document.getElementById('threejs-editor') as HTMLIFrameElement
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
    }
  }

  return (
    <>
      <Navbar />
      <Box sx={{ height: 'calc(100vh - 67px)', display: 'flex', flexDirection: 'column' }}>
        {/* Editor Controls Bar */}
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Typography variant="h6" fontWeight="bold">
            <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tinkercad Editor
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Bantuan & Tutorial">
              <IconButton onClick={() => setHelpDialogOpen(true)} color="primary" size="small">
                <Help />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Editor">
              <IconButton onClick={handleRefresh} color="secondary" size="small">
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Fullscreen">
              <IconButton onClick={handleFullscreen} color="info" size="small">
                <Fullscreen />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => setSaveDialogOpen(true)}
              color="success"
              disabled={!user}
              size="small"
            >
              Simpan STL
            </Button>
          </Stack>
        </Box>

        {/* Quick Stats Bar (Compact) */}
        {user && (
          <Box sx={{ px: 2, py: 0.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={2}>
              <Chip
                icon={<ViewInAr />}
                label={`${userStats.totalModels} Model`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<Download />}
                label={`${userStats.totalDownloads} Download`}
                color="secondary"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<Save />}
                label={`${userStats.publicModels} Publik`}
                color="success"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>
        )}

        {/* Main Editor Container - Full height minus header */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            zIndex: 1
          }}>
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Memuat Tinkercad Editor...
              </Typography>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Harap tunggu, editor sedang dimuat dari Tinkercad
              </Typography>
            </Box>
          </Box>
        )}

        {blocked && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            zIndex: 1
          }}>
            <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Editor Tidak Dapat Dimuat
                </Typography>
                <Typography variant="body2" paragraph>
                  Tinkercad Editor mungkin diblokir oleh browser atau jaringan Anda.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                  >
                    Coba Lagi
                  </Button>
                  <Button
                    variant="outlined"
                    href="https://www.tinkercad.com/things/3FKpBcshjxc"
                    target="_blank"
                    startIcon={<ViewInAr />}
                  >
                    Buka di Tab Baru
                  </Button>
                </Stack>
              </Alert>
            </Box>
          </Box>
        )}

        {/* Tinkercad Editor Iframe - Full size */}
        <iframe
          id="threejs-editor"
          src="https://www.tinkercad.com/embed/3FKpBcshjxc?editbtn=1&simlab=1"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: loading ? 'none' : 'block'
          }}
          title="Tinkercad Editor"
          onLoad={() => {
            setLoading(false)
            setBlocked(false)
          }}
          onError={() => {
            setLoading(false)
            setBlocked(true)
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        />

        {/* Info Cards Below Editor */}
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Card 1: Link to Tinkercad */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LinkIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Buka di Tinkercad
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    Buat model sesuka anda di Tinkercad dan upload hasilnya di tombol "Simpan Projek"
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<OpenInNew />}
                    href="https://www.tinkercad.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    Buka Editor Tinkercad
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Usage Guide */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <HelpOutline color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                    <Typography variant="h6" fontWeight="bold" color="secondary">
                      Petunjuk Penggunaan
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Langkah-langkah dasar:</strong>
                  </Typography>

                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Drag objek dari panel kanan ke workspace
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Klik objek untuk memilih, drag untuk memindahkan
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Gunakan handle untuk resize atau rotate
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Tekan Shift + drag untuk menggabungkan objek
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Klik "Export" untuk download model 3D
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Help />}
                    onClick={() => setHelpDialogOpen(true)}
                    fullWidth
                  >
                    Lihat Tutorial Lengkap
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
        </Box>
      </Box>

      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <CloudUpload sx={{ mr: 1, verticalAlign: 'middle' }} />
          Upload & Simpan File STL
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload file STL hasil kerja Anda dari Tinkercad untuk disimpan ke akun Anda.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Nama Project"
            fullWidth
            variant="outlined"
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            placeholder="Contoh: Model Rumah Saya"
            disabled={exporting}
            helperText="Beri nama untuk project Anda"
            sx={{ mb: 2 }}
          />

          {/* File Upload Section */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFile />}
              fullWidth
              disabled={exporting}
            >
              {selectedFile ? selectedFile.name : 'Pilih File STL'}
              <input
                type="file"
                hidden
                accept=".stl"
                onChange={handleFileSelect}
              />
            </Button>

            {selectedFile && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'success.50', borderRadius: 1, border: 1, borderColor: 'success.200' }}>
                <Typography variant="body2" color="success.main">
                  <strong>File dipilih:</strong> {selectedFile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ukuran: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}

            {fileError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {fileError}
              </Alert>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Cara export dari Tinkercad:</strong>
            </Typography>
            <Typography variant="body2" component="ol" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li>Klik tombol "Export" di Tinkercad editor</li>
              <li>Pilih format ".STL"</li>
              <li>Download file STL ke komputer Anda</li>
              <li>Upload file tersebut di sini</li>
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSaveDialogOpen(false)
            setSelectedFile(null)
            setFileError('')
          }} disabled={exporting}>
            Batal
          </Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            disabled={!exportName.trim() || !selectedFile || exporting}
            startIcon={exporting ? null : <CloudUpload />}
          >
            {exporting ? 'Mengupload...' : 'Upload & Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onClose={() => setHelpDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Help sx={{ mr: 1, verticalAlign: 'middle' }} />
          Panduan Tinkercad Editor
          <IconButton
            onClick={() => setHelpDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom color="primary">
            🎯 Cara Menggunakan Editor:
          </Typography>

          <Box component="ol" sx={{ pl: 2 }}>
            <Typography component="li" paragraph>
              <strong>Menambah Objek:</strong> Klik menu "Add" untuk menambah geometri (Box, Sphere, Cylinder, dll.)
            </Typography>
            <Typography component="li" paragraph>
              <strong>Memindah Objek:</strong> Klik objek lalu drag untuk memindahkan posisi
            </Typography>
            <Typography component="li" paragraph>
              <strong>Mengubah Ukuran:</strong> Pilih objek, lalu gunakan panel Properties di sebelah kanan
            </Typography>
            <Typography component="li" paragraph>
              <strong>Mengubah Warna:</strong> Di panel Material, klik color untuk mengubah warna objek
            </Typography>
            <Typography component="li" paragraph>
              <strong>Menyimpan:</strong> Klik tombol "Simpan & Export STL" untuk menyimpan model Anda
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom color="secondary" sx={{ mt: 3 }}>
            🛠️ Tips Membuat Model Geometri:
          </Typography>

          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" paragraph>
              Gunakan <strong>CylinderGeometry</strong> untuk membuat tabung
            </Typography>
            <Typography component="li" paragraph>
              Gunakan <strong>ConeGeometry</strong> untuk membuat kerucut
            </Typography>
            <Typography component="li" paragraph>
              Gunakan <strong>SphereGeometry</strong> untuk membuat bola
            </Typography>
            <Typography component="li" paragraph>
              Kombinasikan beberapa objek untuk membuat model yang kompleks
            </Typography>
            <Typography component="li" paragraph>
              Ubah parameter di Properties panel untuk menyesuaikan ukuran
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Export STL:</strong> Setelah membuat model, klik "Simpan & Export STL" untuk menyimpan
              file yang bisa digunakan untuk 3D printing atau visualisasi lebih lanjut!
            </Typography>
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  )
}