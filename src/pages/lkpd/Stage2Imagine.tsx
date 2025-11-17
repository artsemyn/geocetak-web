// src/pages/lkpd/Stage2Imagine.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack
} from '@mui/material';
import { Lightbulb } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { ImageUpload } from '../../components/lkpd/ImageUpload';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage2Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage2Imagine({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();

  const [formData, setFormData] = useState<Stage2Data>({
    sketch_images: [],
    design_description: '',
    checklist: {
      sketch_clear: false,
      size_determined: false,
      easy_to_make: false,
      matches_goal: false,
    },
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage2) {
      setFormData(lkpdData.stage2);
    }
  }, [lkpdData]);

  // Auto-save
  useEffect(() => {
    if (!formData.design_description && formData.sketch_images.length === 0) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(2, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleChecklistChange = (key: keyof Stage2Data['checklist']) => {
    setFormData((prev) => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: !prev.checklist[key],
      },
    }));
  };

  const handleSubmit = async () => {
    if (formData.sketch_images.length === 0 || !formData.design_description) {
      alert('Mohon upload minimal 1 gambar dan isi deskripsi!');
      return;
    }

    try {
      await updateStage(2, formData);
      onNext();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const isValid = formData.sketch_images.length > 0 && formData.design_description.length >= 20;

  const checklistItems = [
    { key: 'sketch_clear', label: 'Sketsa sudah jelas dan detail' },
    { key: 'size_determined', label: 'Ukuran sudah ditentukan' },
    { key: 'easy_to_make', label: 'Desain mudah untuk dibuat di Tinkercad' },
    { key: 'matches_goal', label: 'Desain sesuai dengan tujuan projek' },
  ];

  return (
    <StageLayout
      stageNumber={2}
      title="Imagine"
      icon={<Lightbulb />}
      color="#E74C3C"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          💡 Visualisasikan Ide Desainmu
        </Typography>

        {/* Image Upload */}
        <Box>
          <ImageUpload
            images={formData.sketch_images}
            onChange={(images) => setFormData({ ...formData, sketch_images: images })}
            maxImages={3}
            maxSizeMB={5}
            label="📤 Upload Sketsa Design"
            helperText="Upload gambar sketsa desainmu (JPG, PNG). Maksimal 3 gambar."
            required
          />
        </Box>

        {/* Description */}
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            ✍️ Deskripsikan desainmu secara singkat <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={formData.design_description}
            onChange={(e) => setFormData({ ...formData, design_description: e.target.value })}
            placeholder="Contoh: Desain berbentuk tabung dengan diameter 8cm dan tinggi 12cm. Bagian atas terbuka untuk memudahkan pengisian air..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#E74C3C',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#E74C3C',
                  borderWidth: 2
                }
              }
            }}
          />
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            {formData.design_description.length} karakter (minimal 20)
          </Typography>
        </Box>

        {/* Checklist */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#E74C3C10',
            borderRadius: 2,
            border: '1px solid #E74C3C40'
          }}
        >
          <Typography variant="h6" fontWeight="600" gutterBottom>
            ✅ Checklist (centang yang sudah dipenuhi):
          </Typography>
          <Stack spacing={1.5} mt={2}>
            {checklistItems.map((item) => (
              <FormControlLabel
                key={item.key}
                control={
                  <Checkbox
                    checked={formData.checklist[item.key as keyof Stage2Data['checklist']]}
                    onChange={() => handleChecklistChange(item.key as keyof Stage2Data['checklist'])}
                    sx={{
                      color: '#E74C3C',
                      '&.Mui-checked': {
                        color: '#E74C3C',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body1" color="textPrimary">
                    {item.label}
                  </Typography>
                }
                sx={{
                  '&:hover': {
                    bgcolor: '#E74C3C08'
                  },
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  mx: 0
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* STEAM Tags */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: 'linear-gradient(135deg, #E74C3C10 0%, #E74C3C05 100%)',
            borderRadius: 2,
            border: '1px solid #E74C3C20'
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
