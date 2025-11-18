// src/components/lkpd/StageLayout.tsx
import { ReactNode } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle
} from '@mui/icons-material';
import Navbar from '../Navbar';

interface StageLayoutProps {
  stageNumber: number;
  title: string;
  icon: ReactNode;
  color: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
  autoSaveStatus?: 'saved' | 'saving' | '';
  nextButtonText?: string;
}

export function StageLayout({
  stageNumber,
  title,
  icon,
  color,
  children,
  onBack,
  onNext,
  isValid,
  autoSaveStatus = '',
  nextButtonText = 'Simpan & Lanjut'
}: StageLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `2px solid ${color}40`
          }}
        >
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: color,
                fontSize: '2.5rem'
              }}
            >
              {icon}
            </Avatar>
            <Box flexGrow={1}>
              <Chip
                label={`TAHAP ${stageNumber} dari 6`}
                size="small"
                sx={{
                  bgcolor: color,
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 1
                }}
              />
              <Typography variant="h4" fontWeight="bold" color="textPrimary">
                {title}
              </Typography>
            </Box>
          </Box>

          {/* Auto-save indicator */}
          {autoSaveStatus === 'saved' && (
            <Box display="flex" alignItems="center" gap={1} mt={2}>
              <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
              <Typography variant="body2" color="#27AE60" fontWeight="600">
                Tersimpan otomatis
              </Typography>
            </Box>
          )}
          {autoSaveStatus === 'saving' && (
            <Typography variant="body2" color="textSecondary" mt={2}>
              Menyimpan...
            </Typography>
          )}
        </Paper>

        {/* Form Content */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          {children}
        </Paper>

        {/* Navigation */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button
              onClick={onBack}
              startIcon={<ArrowBack />}
              variant="outlined"
              size="large"
              sx={{ px: 4 }}
            >
              Kembali
            </Button>
            <Button
              onClick={onNext}
              endIcon={<ArrowForward />}
              variant="contained"
              size="large"
              disabled={!isValid}
              sx={{
                px: 4,
                bgcolor: color,
                '&:hover': {
                  bgcolor: color,
                  opacity: 0.9
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500'
                }
              }}
            >
              {nextButtonText}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
