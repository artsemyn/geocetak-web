// src/pages/lkpd/SuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Home,
  List,
  Email,
  Star,
  Lock
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';

interface SuccessPageProps {
  assignmentId?: string;
  projectTitle?: string;
  submissionTime?: string;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  assignmentId,
  projectTitle = 'LKPD Pembelajaran',
  submissionTime,
}) => {
  const navigate = useNavigate();
  const params = useParams<{ assignmentId: string }>();
  const id = assignmentId || params.assignmentId;
  const [displayedTime, setDisplayedTime] = useState<string>('');

  useEffect(() => {
    // Add celebratory style with animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotateZ(360deg);
          opacity: 0;
        }
      }
      .confetti {
        position: fixed;
        pointer-events: none;
        animation: fall 3s ease-out forwards;
        z-index: 9999;
      }
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);

    // Create falling particles
    const emojis = ['🎉', '🎊', '⭐', '✨', '🎈'];
    for (let i = 0; i < 50; i++) {
      const confettiEl = document.createElement('div');
      confettiEl.className = 'confetti';
      confettiEl.style.left = Math.random() * 100 + '%';
      confettiEl.style.top = '-10px';
      confettiEl.style.fontSize = Math.random() * 20 + 10 + 'px';
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      if (emoji) confettiEl.textContent = emoji;
      confettiEl.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confettiEl);
      setTimeout(() => confettiEl.remove(), 3500);
    }

    return () => style.remove();
  }, []);

  useEffect(() => {
    // Set current time if not provided
    if (!submissionTime) {
      const now = new Date();
      setDisplayedTime(
        now.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } else {
      setDisplayedTime(submissionTime);
    }
  }, [submissionTime]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLKPDList = () => {
    navigate('/lkpd');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Navbar />

      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Box sx={{ width: '100%' }}>
          {/* Success Container */}
          <Card
            elevation={4}
            sx={{
              overflow: 'visible',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: 8
              }
            }}
          >
            {/* Header with gradient */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                p: 4,
                textAlign: 'center'
              }}
            >
              {/* Animated checkmark */}
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'white',
                    animation: 'bounce 2s infinite'
                  }}
                >
                  <CheckCircle sx={{ fontSize: 50, color: '#27AE60' }} />
                </Avatar>
              </Box>

              <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
                🎉 Selamat! 🎊
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                LKPD Berhasil Dikumpulkan
              </Typography>
            </Box>

            {/* Content */}
            <CardContent sx={{ p: 4 }}>
              {/* Message */}
              <Typography variant="body1" textAlign="center" color="textPrimary" gutterBottom>
                LKPD kamu sudah berhasil dikumpulkan!
              </Typography>
              <Typography variant="body2" textAlign="center" color="textSecondary" mb={3}>
                Guru akan menilai dalam beberapa hari.
              </Typography>

              {/* Details Card */}
              <Card sx={{ bgcolor: '#27AE6010', border: '1px solid #27AE6040', mb: 3 }}>
                <CardContent>
                  {projectTitle && (
                    <>
                      <Box mb={2}>
                        <Typography variant="caption" fontWeight="bold" color="textSecondary">
                          PROYEK
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="textPrimary">
                          {projectTitle}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                    </>
                  )}

                  <Box mb={2}>
                    <Typography variant="caption" fontWeight="bold" color="textSecondary">
                      STATUS
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: '#27AE60',
                          borderRadius: '50%'
                        }}
                      />
                      <Typography variant="body2" fontWeight="medium" color="#27AE60">
                        Dikumpulkan
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  <Box>
                    <Typography variant="caption" fontWeight="bold" color="textSecondary">
                      WAKTU PENGUMPULAN
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" color="textPrimary">
                      {displayedTime}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Info Messages */}
              <Stack spacing={2} mb={3}>
                <Card sx={{ bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="start" gap={2}>
                      <Email sx={{ color: '#1976D2', fontSize: 24, flexShrink: 0 }} />
                      <Typography variant="body2" color="textPrimary">
                        Notifikasi feedback akan dikirim ke emailmu saat guru selesai menilai
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: '#F3E5F5', border: '1px solid #CE93D8' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="start" gap={2}>
                      <Star sx={{ color: '#9C27B0', fontSize: 24, flexShrink: 0 }} />
                      <Typography variant="body2" color="textPrimary">
                        Kerja kerasmu akan dievaluasi dengan rubrik penilaian yang telah ditetapkan
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFB74D' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" alignItems="start" gap={2}>
                      <Lock sx={{ color: '#F57C00', fontSize: 24, flexShrink: 0 }} />
                      <Typography variant="body2" color="textPrimary">
                        LKPD yang sudah dikumpulkan tidak bisa diedit lagi
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Stack>

              {/* Action Buttons */}
              <Stack spacing={2}>
                <Button
                  onClick={handleBackToDashboard}
                  variant="contained"
                  size="large"
                  startIcon={<Home />}
                  sx={{
                    background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #229954 0%, #27AE60 100%)',
                      boxShadow: 4
                    }
                  }}
                >
                  Kembali ke Dashboard
                </Button>

                <Button
                  onClick={handleBackToLKPDList}
                  variant="outlined"
                  size="large"
                  startIcon={<List />}
                  sx={{
                    borderColor: '#BDBDBD',
                    color: 'textPrimary',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#9E9E9E',
                      bgcolor: '#F5F5F5'
                    }
                  }}
                >
                  Lihat Daftar LKPD
                </Button>
              </Stack>
            </CardContent>

            {/* Footer */}
            <Box
              sx={{
                bgcolor: '#F5F5F5',
                px: 4,
                py: 2,
                textAlign: 'center',
                borderTop: '1px solid #E0E0E0'
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Submission ID:{' '}
                <Chip
                  label={id}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
              </Typography>
            </Box>
          </Card>

          {/* Additional Info */}
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              ✨ Terima kasih telah mengerjakan LKPD dengan sepenuh hati! ✨
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SuccessPage;
