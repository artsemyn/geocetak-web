// src/pages/lkpd/Stage6Reflect.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Psychology, Warning, CheckCircle } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage6Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export function Stage6Reflect({ onBack, onComplete }: Props) {
  const { lkpdData, autoSave, updateStage, getProgress } = useLKPDSection();

  const [formData, setFormData] = useState<Stage6Data>({
    learning_reflection: '',
    challenges: '',
    application: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage6) {
      setFormData(lkpdData.stage6);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.learning_reflection && !formData.challenges && !formData.application) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(6, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = () => {
    const reflectionWords = countWords(formData.learning_reflection);
    const challengesWords = countWords(formData.challenges);
    const applicationWords = countWords(formData.application);

    if (reflectionWords < 50 || challengesWords < 50 || applicationWords < 30) {
      alert('Mohon lengkapi semua refleksi sesuai minimal kata!');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      await updateStage(6, formData);
      onComplete();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const isValid = countWords(formData.learning_reflection) >= 50 &&
    countWords(formData.challenges) >= 50 &&
    countWords(formData.application) >= 30;

  const progress = getProgress();

  return (
    <StageLayout
      stageNumber={6}
      title="Share & Reflect"
      icon={<Psychology />}
      color="#1ABC9C"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
      nextButtonText="✓ Kumpulkan LKPD"
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        {/* Success Alert */}
        <Alert severity="success" icon="🎉">
          <Typography variant="body1" fontWeight="medium">
            Selamat! Kamu sudah menyelesaikan semua tahapan. Sekarang waktunya refleksi.
          </Typography>
        </Alert>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          💭 Refleksi Pembelajaran
        </Typography>

        {/* Question 1 */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            1. Apa yang kamu pelajari dari kegiatan ini? <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={formData.learning_reflection}
            onChange={(e) => setFormData({ ...formData, learning_reflection: e.target.value })}
            placeholder="Jelaskan apa yang kamu pelajari tentang geometri 3D, proses desain, dan aplikasinya dalam kehidupan nyata..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1ABC9C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1ABC9C',
                  borderWidth: 2
                }
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography
              variant="caption"
              sx={{
                color: countWords(formData.learning_reflection) >= 50 ? '#27AE60' : 'textSecondary',
                fontWeight: countWords(formData.learning_reflection) >= 50 ? 'bold' : 'normal'
              }}
            >
              {countWords(formData.learning_reflection)} / 50 kata (minimal)
            </Typography>
            {countWords(formData.learning_reflection) >= 50 && (
              <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
            )}
          </Box>
        </Box>

        {/* Question 2 */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            2. Apa kekurangan yang kamu rasakan selama mengerjakan proyek ini?{' '}
            <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={6}
            fullWidth
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="Jelaskan tantangan yang dihadapi, aspek yang perlu diperbaiki, dan pembelajaran dari kesalahan..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1ABC9C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1ABC9C',
                  borderWidth: 2
                }
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography
              variant="caption"
              sx={{
                color: countWords(formData.challenges) >= 50 ? '#27AE60' : 'textSecondary',
                fontWeight: countWords(formData.challenges) >= 50 ? 'bold' : 'normal'
              }}
            >
              {countWords(formData.challenges)} / 50 kata (minimal)
            </Typography>
            {countWords(formData.challenges) >= 50 && (
              <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
            )}
          </Box>
        </Box>

        {/* Question 3 */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            3. Kamu akan menerapkan/menggunakan barang hasil desainmu untuk apa?{' '}
            <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={formData.application}
            onChange={(e) => setFormData({ ...formData, application: e.target.value })}
            placeholder="Jelaskan rencana penggunaan desainmu dalam kehidupan sehari-hari..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1ABC9C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1ABC9C',
                  borderWidth: 2
                }
              }
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography
              variant="caption"
              sx={{
                color: countWords(formData.application) >= 30 ? '#27AE60' : 'textSecondary',
                fontWeight: countWords(formData.application) >= 30 ? 'bold' : 'normal'
              }}
            >
              {countWords(formData.application)} / 30 kata (minimal)
            </Typography>
            {countWords(formData.application) >= 30 && (
              <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
            )}
          </Box>
        </Box>

        {/* Project Summary */}
        <Card sx={{ bgcolor: '#E3F2FD', border: '2px solid #90CAF9' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" color="#1976D2" gutterBottom>
              📊 Ringkasan Proyek:
            </Typography>
            <Box sx={{ '& > *': { mb: 1 } }}>
              <Box display="flex" alignItems="center" gap={1}>
                <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                <Typography variant="body2" color="textPrimary">
                  Semua 6 tahap selesai ({progress.completed}/6)
                </Typography>
              </Box>
              {lkpdData?.stage2 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                  <Typography variant="body2" color="textPrimary">
                    {lkpdData.stage2.sketch_images.length} sketsa design
                  </Typography>
                </Box>
              )}
              {lkpdData?.stage4?.stl_file && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                  <Typography variant="body2" color="textPrimary">
                    1 file STL ({lkpdData.stage4.stl_file.name})
                  </Typography>
                </Box>
              )}
              {lkpdData?.stage5 && (
                <>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                    <Typography variant="body2" color="textPrimary">
                      {lkpdData.stage5.result_photos.length} foto hasil
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                    <Typography variant="body2" color="textPrimary">
                      Volume: {lkpdData.stage5.calculated_volume} cm³
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert severity="warning" icon={<Warning />}>
          <Typography variant="body1" fontWeight="medium">
            Setelah dikumpulkan, LKPD tidak bisa diedit lagi! Pastikan semua sudah benar.
          </Typography>
        </Alert>

        {/* STEAM Tags */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'linear-gradient(135deg, #1ABC9C10 0%, #1ABC9C05 100%)',
            borderRadius: 2,
            border: '1px solid #1ABC9C20'
          }}
        >
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body1" fontWeight="600" color="textSecondary">
              Tag STEAM aktif:
            </Typography>
            <Chip
              label="🎨 Arts"
              sx={{
                bgcolor: 'white',
                fontWeight: 'medium',
                boxShadow: 1
              }}
            />
            <Chip
              label="💻 Technology"
              sx={{
                bgcolor: 'white',
                fontWeight: 'medium',
                boxShadow: 1
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Warning sx={{ fontSize: 60, color: '#F39C12', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold">
            Konfirmasi Pengumpulan
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="textSecondary" textAlign="center">
            Apakah kamu yakin ingin mengumpulkan LKPD ini? Setelah dikumpulkan, data tidak bisa
            diubah lagi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowConfirmModal(false)}
            variant="outlined"
            fullWidth
            size="large"
          >
            Batal
          </Button>
          <Button
            onClick={handleFinalSubmit}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              bgcolor: '#27AE60',
              '&:hover': {
                bgcolor: '#229954'
              }
            }}
          >
            Ya, Kumpulkan
          </Button>
        </DialogActions>
      </Dialog>
    </StageLayout>
  );
}
