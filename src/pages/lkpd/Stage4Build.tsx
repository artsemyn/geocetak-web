// src/pages/lkpd/Stage4Build.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Build } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { FileUpload } from '../../components/lkpd/FileUpload';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage4Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage4Build({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();

  const [formData, setFormData] = useState<Stage4Data>({
    challenges: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage4) {
      setFormData(lkpdData.stage4);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.challenges && !formData.stl_file) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(4, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleFileChange = (fileData: { file: string; fileName: string } | null) => {
    if (fileData) {
      setFormData({
        ...formData,
        stl_file: {
          name: fileData.fileName,
          size: (fileData.file.length * 3) / 4, // Estimate size from base64
          url: fileData.file,
          uploaded_at: new Date().toISOString(),
        },
      });
    } else {
      setFormData({ ...formData, stl_file: undefined });
    }
  };

  const handleSubmit = async () => {
    if (!formData.stl_file || !formData.challenges) {
      alert('Mohon upload file STL dan isi tantangan yang dihadapi!');
      return;
    }

    try {
      await updateStage(4, formData);
      onNext();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const isValid = !!formData.stl_file && formData.challenges.length >= 10;

  return (
    <StageLayout
      stageNumber={4}
      title="Create / Build"
      icon={<Build />}
      color="#F39C12"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🏗️ Upload File STL
        </Typography>

        {/* File Upload */}
        <Box>
          <FileUpload
            file={formData.stl_file?.url || null}
            fileName={formData.stl_file?.name || null}
            onChange={handleFileChange}
            acceptedFormats=".stl"
            maxSizeMB={50}
            label="📤 Upload File STL dari Tinkercad"
            helperText="Upload file STL yang sudah kamu export dari Tinkercad. Maksimal 50MB."
            required
          />
        </Box>

        {/* Instructions */}
        <Alert severity="info" icon="💡">
          <Typography variant="body2" fontWeight="600" gutterBottom>
            Cara export STL dari Tinkercad:
          </Typography>
          <List dense sx={{ m: 0, p: 0 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>1.</strong> Klik "Export" di menu atas
                  </Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>2.</strong> Pilih format ".STL"
                  </Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>3.</strong> Download file ke komputer
                  </Typography>
                }
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    <strong>4.</strong> Upload file tersebut di sini
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Alert>

        {/* Challenges */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            🔧 Apa tantangan atau hambatan yang kamu temui saat membuat design ini?{' '}
            <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="Contoh: Sulit mengatur ketebalan dinding agar tidak terlalu tipis. Sempat kesulitan menggabungkan dua bentuk geometri..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#F39C12',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F39C12',
                  borderWidth: 2
                }
              }
            }}
          />
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            {formData.challenges.length} karakter (minimal 10)
          </Typography>
        </Box>

        {/* STEAM Tags */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'linear-gradient(135deg, #F39C1210 0%, #F39C1205 100%)',
            borderRadius: 2,
            border: '1px solid #F39C1220'
          }}
        >
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="body1" fontWeight="600" color="textSecondary">
              Tag STEAM aktif:
            </Typography>
            <Chip
              label="⚙️ Engineering"
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
    </StageLayout>
  );
}
