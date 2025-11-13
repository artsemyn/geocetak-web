// src/pages/lkpd/Stage5Test.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { Science } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { ImageUpload } from '../../components/lkpd/ImageUpload';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage5Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage5Test({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();

  const [formData, setFormData] = useState<Stage5Data>({
    calculated_volume: 0,
    surface_area: 0,
    capacity: 0,
    strengths: '',
    weaknesses: '',
    result_photos: [],
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Calculate volume and surface area from Stage 3 data
  useEffect(() => {
    if (lkpdData?.stage3) {
      const { radius, height } = lkpdData.stage3;

      // Volume tabung: V = πr²t
      const volume = Math.PI * Math.pow(radius, 2) * height;

      // Luas permukaan tabung: A = 2πr(r + t)
      const surfaceArea = 2 * Math.PI * radius * (radius + height);

      // Kapasitas dalam ml (1 cm³ = 1 ml)
      const capacity = volume;

      setFormData((prev) => ({
        ...prev,
        calculated_volume: parseFloat(volume.toFixed(2)),
        surface_area: parseFloat(surfaceArea.toFixed(2)),
        capacity: parseFloat(capacity.toFixed(2)),
      }));
    }
  }, [lkpdData]);

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage5) {
      setFormData((prev) => ({
        ...prev,
        ...lkpdData.stage5,
      }));
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.strengths && !formData.weaknesses) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(5, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleSubmit = () => {
    if (!formData.strengths || !formData.weaknesses || formData.result_photos.length === 0) {
      alert('Mohon lengkapi analisis dan upload minimal 1 foto!');
      return;
    }

    updateStage(5, formData);
    onNext();
  };

  const isValid = formData.strengths.length >= 20 &&
    formData.weaknesses.length >= 20 &&
    formData.result_photos.length >= 1;

  return (
    <StageLayout
      stageNumber={5}
      title="Test & Observe"
      icon={<Science />}
      color="#9B59B6"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🧪 Analisis & Uji Desainmu
        </Typography>

        {/* Auto Calculations */}
        <Card
          sx={{
            bgcolor: '#E3F2FD',
            border: '2px solid #90CAF9'
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="600" color="#1976D2" gutterBottom>
              📊 Perhitungan Otomatis:
            </Typography>
            <Typography variant="body2" color="#1976D2" gutterBottom>
              (Berdasarkan ukuran dari Tahap 3)
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'white', textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Volume (V):
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="textPrimary">
                    {formData.calculated_volume}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    cm³
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'white', textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Luas Permukaan (A):
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="textPrimary">
                    {formData.surface_area}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    cm²
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'white', textAlign: 'center', p: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Kapasitas Air:
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="textPrimary">
                    {formData.capacity}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ml
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: 'white', p: 2 }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                💡 Rumus yang digunakan (Tabung):
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>V = πr²t</li>
                <li>A = 2πr(r + t)</li>
                <li>Kapasitas = V (1 cm³ = 1 ml)</li>
              </Box>
            </Card>
          </CardContent>
        </Card>

        {/* Analysis Section */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            📝 Analisis Desain:
          </Typography>

          {/* Strengths */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="600" gutterBottom>
              Apa kelebihan desainmu? <span style={{ color: '#E74C3C' }}>*</span>
            </Typography>
            <TextField
              multiline
              rows={5}
              fullWidth
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="Contoh: Bentuk sederhana dan mudah digenggam, volume sesuai target 500ml. Desain efisien dalam penggunaan material..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9B59B6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9B59B6',
                    borderWidth: 2
                  }
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              {formData.strengths.length} karakter (minimal 20)
            </Typography>
          </Box>

          {/* Weaknesses */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="600" gutterBottom>
              Apa kekurangan desainmu? <span style={{ color: '#E74C3C' }}>*</span>
            </Typography>
            <TextField
              multiline
              rows={5}
              fullWidth
              value={formData.weaknesses}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              placeholder="Contoh: Tidak ada pegangan, jadi agak licin saat dipegang. Bagian atas terlalu lebar sehingga kurang praktis..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#9B59B6',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9B59B6',
                    borderWidth: 2
                  }
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              {formData.weaknesses.length} karakter (minimal 20)
            </Typography>
          </Box>
        </Box>

        {/* Photo Upload */}
        <Box>
          <ImageUpload
            images={formData.result_photos}
            onChange={(photos) => setFormData({ ...formData, result_photos: photos })}
            maxImages={3}
            maxSizeMB={5}
            label="📸 Upload Foto Barang Jadi"
            helperText="Upload foto hasil cetakan 3D atau model fisikmu. Minimal 1 foto, maksimal 3 foto."
            required
          />
        </Box>

        {/* STEAM Tags */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'linear-gradient(135deg, #9B59B610 0%, #9B59B605 100%)',
            borderRadius: 2,
            border: '1px solid #9B59B620'
          }}
        >
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body1" fontWeight="600" color="textSecondary">
              Tag STEAM aktif:
            </Typography>
            <Chip
              label="🔬 Science"
              sx={{
                bgcolor: 'white',
                fontWeight: 'medium',
                boxShadow: 1
              }}
            />
            <Chip
              label="⚙️ Engineering"
              sx={{
                bgcolor: 'white',
                fontWeight: 'medium',
                boxShadow: 1
              }}
            />
            <Chip
              label="➗ Mathematics"
              sx={{
                bgcolor: 'white',
                fontWeight: 'medium',
                boxShadow: 1
              }}
            />
          </Box>
        </Box>
      </Box>
    </StageLayout>
  );
}
