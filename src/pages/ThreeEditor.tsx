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
  Close
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

  const handleSaveProject = async () => {
    if (!exportName.trim()) {
      return
    }

    setExporting(true)
    try {
      // Save model to database
      const result = await ModelExportService.saveModelExport({
        projectName: exportName,
        modelType: 'threejs-custom',
        description: `3D model created with Three.js Editor: ${exportName}`,
        geometryParams: {
          createdWith: 'threejs-editor',
          timestamp: new Date().toISOString()
        },
        tags: ['threejs', 'custom', 'geometry'],
        isPublic: false
      })

      if (result) {
        console.log('✅ Project saved successfully:', result)

        // Update user stats
        const newStats = await ModelExportService.getUserModelStats(user!.id)
        setUserStats(newStats)

        // Show success and close dialog
        setSaveDialogOpen(false)
        setExportName('')

        // Could show a success toast here
        alert('🎉 Model berhasil disimpan! File STL tersedia untuk diunduh.')
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
        </Box>
      </Box>

      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Save sx={{ mr: 1, verticalAlign: 'middle' }} />
          Simpan & Export Project ke STL
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Beri nama untuk project Anda. File akan disimpan dalam format STL yang bisa digunakan untuk 3D printing.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Nama Project"
            fullWidth
            variant="outlined"
            value={exportName}
            onChange={(e) => setExportName(e.target.value)}
            placeholder="Contoh: Tabung Kustom Saya"
            disabled={exporting}
            helperText="Nama akan digunakan untuk file STL: nama-project.stl"
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Catatan:</strong> Pastikan Anda sudah membuat model 3D di editor sebelum menyimpan.
              File STL akan tersimpan di akun Anda dan bisa diunduh kapan saja.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={exporting}>
            Batal
          </Button>
          <Button
            onClick={handleSaveProject}
            variant="contained"
            disabled={!exportName.trim() || exporting}
            startIcon={exporting ? null : <Download />}
          >
            {exporting ? 'Menyimpan...' : 'Simpan STL'}
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