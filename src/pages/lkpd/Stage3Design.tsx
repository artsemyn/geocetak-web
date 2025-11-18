// src/pages/lkpd/Stage3Design.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { DesignServices, OpenInNew } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage3Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage3Design({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();

  const [formData, setFormData] = useState<Stage3Data>({
    tinkercad_url: '',
    diameter: 0,
    radius: 0,
    height: 0,
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage3) {
      setFormData(lkpdData.stage3);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (formData.diameter === 0 && formData.height === 0) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(3, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleDiameterChange = (value: string) => {
    const diameter = parseFloat(value) || 0;
    setFormData({
      ...formData,
      diameter,
      radius: diameter / 2,
    });
  };

  const handleHeightChange = (value: string) => {
    const height = parseFloat(value) || 0;
    setFormData({ ...formData, height });
  };

  const handleSubmit = () => {
    if (formData.diameter === 0 || formData.height === 0) {
      alert('Mohon lengkapi diameter dan tinggi!');
      return;
    }

    updateStage(3, formData);
    onNext();
  };

  const isValid = formData.diameter > 0 && formData.height > 0;

  return (
    <StageLayout
      stageNumber={3}
      title="Plan & Design"
      icon={<DesignServices />}
      color="#27AE60"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🖥️ Buat Model 3D di Tinkercad
        </Typography>

        {/* Tinkercad Section */}
        <Card
          sx={{
            bgcolor: '#27AE6015',
            border: '2px solid #27AE6040',
            borderRadius: 2
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🔗 Link ke Tinkercad
            </Typography>

            <Button
              id="tinkercad-link"
              variant="contained"
              href="https://www.tinkercad.com"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNew />}
              sx={{
                bgcolor: '#27AE60',
                mb: 2,
                '&:hover': {
                  bgcolor: '#229954'
                }
              }}
            >
              🚀 Buka Tinkercad di Tab Baru
            </Button>

            <Alert severity="info" icon="💡" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Tips:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li>Login dengan akun Google/email</li>
                <li>Buat project baru</li>
                <li>Gunakan basic shapes untuk membuat design</li>
                <li>Jangan lupa save projectmu!</li>
              </Box>
            </Alert>

            {/* Optional: Tinkercad URL Input */}
            <Box>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Link Tinkercad Project (optional):
              </Typography>
              <TextField
                type="url"
                fullWidth
                value={formData.tinkercad_url}
                onChange={(e) => setFormData({ ...formData, tinkercad_url: e.target.value })}
                placeholder="https://www.tinkercad.com/things/..."
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#27AE60',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#27AE60',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Dimension Inputs */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            📐 Isi Ukuran Desainmu:
          </Typography>

          <Box
            sx={{
              p: 3,
              bgcolor: '#27AE6010',
              borderRadius: 2,
              border: '1px solid #27AE6030'
            }}
          >
            <Grid container spacing={3}>
              {/* Diameter */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="600" gutterBottom>
                  Diameter (d): <span style={{ color: '#E74C3C' }}>*</span>
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1, min: 0 }}
                    value={formData.diameter || ''}
                    onChange={(e) => handleDiameterChange(e.target.value)}
                    placeholder="0.0"
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#27AE60',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#27AE60',
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium" sx={{ minWidth: '3rem' }}>
                    cm
                  </Typography>
                </Box>
              </Grid>

              {/* Radius (auto-calculated) */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="600" gutterBottom>
                  Jari-jari (r):
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    type="number"
                    value={formData.radius || ''}
                    placeholder="(auto: d/2)"
                    fullWidth
                    variant="outlined"
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#F5F5F5'
                      }
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium" sx={{ minWidth: '3rem' }}>
                    cm
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                  Otomatis dihitung: diameter ÷ 2
                </Typography>
              </Grid>

              {/* Height */}
              <Grid item xs={12} md={6}>
                <Typography variant="body1" fontWeight="600" gutterBottom>
                  Tinggi (t): <span style={{ color: '#E74C3C' }}>*</span>
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    type="number"
                    inputProps={{ step: 0.1, min: 0 }}
                    value={formData.height || ''}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="0.0"
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#27AE60',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#27AE60',
                          borderWidth: 2
                        }
                      }
                    }}
                  />
                  <Typography variant="body1" fontWeight="medium" sx={{ minWidth: '3rem' }}>
                    cm
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Preview Dimensions */}
          {isValid && (
            <Card sx={{ mt: 3, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <CardContent>
                <Typography variant="body2" fontWeight="600" color="#1976D2" gutterBottom>
                  📊 Preview Ukuran:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="#1976D2">
                      Diameter: <strong>{formData.diameter} cm</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="#1976D2">
                      Radius: <strong>{formData.radius.toFixed(2)} cm</strong>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="#1976D2">
                      Tinggi: <strong>{formData.height} cm</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* STEAM Tags */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'linear-gradient(135deg, #27AE6010 0%, #27AE6005 100%)',
            borderRadius: 2,
            border: '1px solid #27AE6020'
          }}
        >
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body1" fontWeight="600" color="textSecondary">
              Tag STEAM aktif:
            </Typography>
            <Chip
              label="💻 Technology"
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
            <Chip
              label="⚙️ Engineering"
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
