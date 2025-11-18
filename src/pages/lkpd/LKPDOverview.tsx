// src/pages/lkpd/LKPDOverview.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  LinearProgress,
  Chip,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  RadioButtonUnchecked,
  FiberManualRecord,
  EmojiObjects,
  Lightbulb,
  DesignServices,
  Build,
  Science,
  Psychology,
  Lock
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import { useLKPDSection } from '../../hooks/useLKPDSection';
import type { LKPDData } from '../../types/lkpd.types';

interface StageCardProps {
  stage: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onClick: () => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  title,
  description,
  isCompleted,
  isCurrent,
  isLocked,
  onClick,
}) => {
  const stageIcons: { [key: number]: JSX.Element } = {
    1: <EmojiObjects sx={{ fontSize: 40 }} />,
    2: <Lightbulb sx={{ fontSize: 40 }} />,
    3: <DesignServices sx={{ fontSize: 40 }} />,
    4: <Build sx={{ fontSize: 40 }} />,
    5: <Science sx={{ fontSize: 40 }} />,
    6: <Psychology sx={{ fontSize: 40 }} />,
  };

  const stageColors: { [key: number]: string } = {
    1: '#4A90E2',
    2: '#E74C3C',
    3: '#27AE60',
    4: '#F39C12',
    5: '#9B59B6',
    6: '#1ABC9C',
  };

  const color = stageColors[stage] || '#4A90E2';

  return (
    <Card
      sx={{
        height: '100%',
        border: isLocked
          ? '1px solid #BDBDBD'
          : isCurrent
          ? `3px solid ${color}`
          : isCompleted
          ? '2px solid #27AE60'
          : '1px solid #E0E0E0',
        boxShadow: isLocked ? 0 : isCurrent ? 6 : isCompleted ? 3 : 1,
        transition: 'all 0.3s',
        transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
        opacity: isLocked ? 0.6 : 1,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        '&:hover': isLocked
          ? {}
          : {
              boxShadow: 8,
              transform: 'translateY(-4px)'
            },
        background: isLocked
          ? '#F5F5F5'
          : isCurrent
          ? `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`
          : isCompleted
          ? 'linear-gradient(135deg, #27AE6015 0%, #27AE6005 100%)'
          : 'white',
        position: 'relative'
      }}
    >
      <CardActionArea onClick={isLocked ? undefined : onClick} disabled={isLocked} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar
              sx={{
                bgcolor: isLocked ? 'grey.400' : isCurrent ? color : isCompleted ? '#27AE60' : 'grey.300',
                width: 56,
                height: 56
              }}
            >
              {isLocked ? <Lock sx={{ fontSize: 30 }} /> : stageIcons[stage]}
            </Avatar>
            <Box flexGrow={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={isLocked ? 'textSecondary' : 'textPrimary'}
                >
                  TAHAP {stage}
                </Typography>
                {isLocked && (
                  <Chip label="Terkunci" size="small" sx={{ bgcolor: '#BDBDBD', color: 'white', fontSize: '0.7rem' }} />
                )}
                {isCompleted && !isLocked && (
                  <CheckCircle sx={{ color: '#27AE60', fontSize: 20 }} />
                )}
                {isCurrent && !isLocked && (
                  <FiberManualRecord sx={{ color: color, fontSize: 16 }} />
                )}
              </Box>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                color={isLocked ? 'textSecondary' : 'textSecondary'}
                gutterBottom
              >
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {isLocked ? `Selesaikan Tahap ${stage - 1} terlebih dahulu` : description}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

interface LKPDOverviewProps {
  data?: LKPDData;
  onSelectStage?: (stage: number) => void;
}

export const LKPDOverview: React.FC<LKPDOverviewProps> = ({
  data,
  onSelectStage
}) => {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { lkpdData, isLoading, initializeProject, getProgress } = useLKPDSection();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Use data prop if provided, otherwise use from hook
  const projectData = data || lkpdData;
  const loading = data ? false : isLoading;

  // Initialize project if no data exists
  useEffect(() => {
    if (!data && !lkpdData && !isLoading) {
      initializeProject();
    }
  }, [data, lkpdData, isLoading, initializeProject]);

  const progress = getProgress();
  const completedStages = progress.completed;
  const currentStage = projectData?.project.current_stage || 1;
  const totalStages = 6;
  const progressPercent = progress.percentage;

  const stages = [
    {
      stage: 1,
      title: 'Define Problem',
      description: 'Tentukan proyek dan tujuanmu',
    },
    {
      stage: 2,
      title: 'Imagine',
      description: 'Visualisasikan ide desainmu',
    },
    {
      stage: 3,
      title: 'Plan & Design',
      description: 'Buat model 3D di Tinkercad',
    },
    {
      stage: 4,
      title: 'Create/Build',
      description: 'Upload file STL hasil design',
    },
    {
      stage: 5,
      title: 'Test & Observe',
      description: 'Analisis dan uji desainmu',
    },
    {
      stage: 6,
      title: 'Share & Reflect',
      description: 'Refleksi pembelajaran',
    },
  ];

  // Check if stage is unlocked
  const isStageUnlocked = (stage: number): boolean => {
    if (stage === 1) return true; // Stage 1 always unlocked

    const prevStage = stage - 1;
    const prevStageData = projectData?.[`stage${prevStage}` as keyof LKPDData];
    return !!(prevStageData as any)?.completed_at;
  };

  const handleStageClick = (stage: number) => {
    // Check if stage is unlocked
    if (!isStageUnlocked(stage)) {
      setSnackbarMessage(`Selesaikan Tahap ${stage - 1} terlebih dahulu untuk membuka Tahap ${stage}`);
      setSnackbarOpen(true);
      return;
    }

    if (onSelectStage) {
      onSelectStage(stage);
    } else {
      // Navigate to the stage
      navigate(`/lkpd/${assignmentId}/stage/${stage}`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Memuat...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Button
            onClick={handleBackToDashboard}
            startIcon={<ArrowBack />}
            sx={{ mb: 2 }}
            variant="text"
            color="primary"
          >
            Kembali ke Dashboard
          </Button>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            6 TAHAPAN LKPD STEM
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {projectData?.project.title || 'Proyek Pembelajaran'}
          </Typography>
        </Box>

        {/* Progress Section */}
        <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Kemajuan Proyek
          </Typography>

          {/* Progress bar */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium" color="textSecondary">
                Progress: {completedStages}/{totalStages} Tahap Selesai
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="textPrimary">
                {progressPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #27AE60 0%, #2ECC71 100%)',
                  borderRadius: 5
                }
              }}
            />
          </Box>

          {/* Stage Stepper */}
          <Stepper activeStep={currentStage - 1} alternativeLabel>
            {stages.map((s) => {
              const isCompleted = projectData?.project.current_stage! > s.stage ||
                (projectData?.[`stage${s.stage}` as keyof LKPDData] as any)?.completed_at;

              return (
                <Step key={s.stage} completed={isCompleted}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isCompleted ? '#27AE60' : currentStage === s.stage ? '#4A90E2' : 'grey.300',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {isCompleted ? <CheckCircle sx={{ fontSize: 20 }} /> : s.stage}
                      </Avatar>
                    )}
                  >
                    <Typography variant="caption" fontWeight="600">
                      T{s.stage}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>

        {/* Stages Grid */}
        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Pilih tahap yang ingin dikerjakan:
          </Typography>

          <Grid container spacing={3} mt={1}>
            {stages.map((s) => {
              const isCompleted = projectData?.project.current_stage! > s.stage ||
                (projectData?.[`stage${s.stage}` as keyof LKPDData] as any)?.completed_at;
              const isCurrent = currentStage === s.stage;
              const isLocked = !isStageUnlocked(s.stage);

              return (
                <Grid item xs={12} md={6} lg={4} key={s.stage}>
                  <StageCard
                    stage={s.stage}
                    title={s.title}
                    description={s.description}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    onClick={() => handleStageClick(s.stage)}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Project Summary */}
        <Paper sx={{ p: 3, mb: 4 }} elevation={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📋 Ringkasan Proyek
          </Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#4A90E215' }}>
                <Typography variant="h4" fontWeight="bold" color="#4A90E2">
                  {totalStages}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Tahapan
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#27AE6015' }}>
                <Typography variant="h4" fontWeight="bold" color="#27AE60">
                  {completedStages}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Selesai
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#F39C1215' }}>
                <Typography variant="h4" fontWeight="bold" color="#F39C12">
                  {totalStages - completedStages}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Tersisa
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#9B59B615' }}>
                <Typography variant="h4" fontWeight="bold" color="#9B59B6">
                  {progressPercent}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Progress
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Info Alert */}
        <Alert severity="info" icon={<EmojiObjects />} sx={{ fontWeight: 500 }}>
          <Typography variant="body2">
            <strong>💡 Tips:</strong> Kerjakan tahapan secara berurutan untuk hasil terbaik.
            Setiap tahapan akan tersimpan otomatis saat kamu pindah ke tahapan berikutnya.
          </Typography>
        </Alert>
      </Container>

      {/* Snackbar for locked stage notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default LKPDOverview;
