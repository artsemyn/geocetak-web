// src/pages/lkpd/Stage1Define.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField
} from '@mui/material';
import { EmojiObjects } from '@mui/icons-material';
import { StageLayout } from '../../components/lkpd/StageLayout';
import { useLKPDSection } from '@/hooks/useLKPDSection';
import type { Stage1Data } from '@/types/lkpd.types';

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function Stage1Define({ onBack, onNext }: Props) {
  const { lkpdData, autoSave, updateStage } = useLKPDSection();

  const [formData, setFormData] = useState<Stage1Data>({
    project_goal: '',
    shape_importance: '',
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Load existing data
  useEffect(() => {
    if (lkpdData?.stage1) {
      setFormData(lkpdData.stage1);
    }
  }, [lkpdData]);

  // Auto-save every 3 seconds
  useEffect(() => {
    if (!formData.project_goal && !formData.shape_importance) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      autoSave(1, formData);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSave]);

  const handleSubmit = async () => {
    if (!formData.project_goal || !formData.shape_importance) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    try {
      await updateStage(1, formData);
      onNext();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const isValid = formData.project_goal.length >= 10 && formData.shape_importance.length >= 10;

  return (
    <StageLayout
      stageNumber={1}
      title="Define the Problem"
      icon={<EmojiObjects />}
      color="#4A90E2"
      onBack={onBack}
      onNext={handleSubmit}
      isValid={isValid}
      autoSaveStatus={autoSaveStatus}
    >
      <Box sx={{ '& > *': { mb: 4 } }}>
        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            1. Projek apa yang akan kamu buat? <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={formData.project_goal}
            onChange={(e) => setFormData({ ...formData, project_goal: e.target.value })}
            placeholder="Contoh: Saya akan membuat gelas berbentuk tabung..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#4A90E2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4A90E2',
                  borderWidth: 2
                }
              }
            }}
          />
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            {formData.project_goal.length} karakter (minimal 10)
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            2. Kenapa kamu memilih projek ini? <span style={{ color: '#E74C3C' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={5}
            fullWidth
            value={formData.shape_importance}
            onChange={(e) => setFormData({ ...formData, shape_importance: e.target.value })}
            placeholder="Contoh: Karena bentuk tabung mudah dibuat dan cocok untuk menyimpan air..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#4A90E2',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4A90E2',
                  borderWidth: 2
                }
              }
            }}
          />
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            {formData.shape_importance.length} karakter (minimal 10)
          </Typography>
        </Box>
      </Box>
    </StageLayout>
  );
}
