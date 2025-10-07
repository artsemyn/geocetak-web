// src/pages/Credits.tsx
import React from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider
} from '@mui/material'
import Navbar from '../components/Navbar'

interface Developer {
  name: string
  role: string
  avatar: string
}

const Credits: React.FC = () => {
  // Profil Tim Pengembang Individual
  const developers: Developer[] = [
    {
      name: "Dr. Farida Nurhasanah, S. Pd., M. Pd.",
      role: "Dosen Pendidikan Matematika UNS",
      avatar: "/images/team/farida.jpg"
    },
    {
      name: "Sutopo, S. Pd., M. Pd.",
      role: "Dosen Pendidikan Matematika UNS",
      avatar: "/images/team/sutopo.jpg"
    },
    {
      name: "Gibran Khalil Gibran",
      role: "Mahasiswa Pendidikan Matematika UNS",
      avatar: "/images/team/gibran.jpg"
    },
    {
      name: "Tri Wilasiati, S. Pd.",
      role: "Guru Matematika Karanganyar",
      avatar: "/images/team/tri.png"
    }
  ]

  const technologies = [
    "React", "TypeScript", "Three.js", "React Three Fiber",
    "Material-UI", "Supabase", "Vite", "Zustand",
    "Google Gemini AI", "Framer Motion"
  ]

  const boxStyles = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const
  }

  return (
    <>
      <Navbar />
      <Box sx={boxStyles}>
        <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
          <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
              Tentang GeoCetak
            </Typography>
            <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Platform Pembelajaran Geometri 3D Interaktif untuk Pendidikan Indonesia
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" gutterBottom fontWeight="bold">
              Tim Pengembang
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Kenalan dengan tim yang berdedikasi membangun GeoCetak untuk pendidikan Indonesia.
            </Typography>

            <Grid
              container
              spacing={4}
              sx={{ mb: 5 }}
              justifyContent="center"
            >
              {developers.map((developer, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 3,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
                      border: '2px solid',
                      borderColor: 'primary.light',
                      transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.25)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Avatar
                      src={developer.avatar}
                      sx={{
                        width: 140,
                        height: 140,
                        mb: 2,
                        border: '4px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 24px rgba(25, 118, 210, 0.2)'
                      }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      align="center"
                      color="text.primary"
                      sx={{
                        mb: 1,
                        fontSize: '1.1rem',
                        lineHeight: 1.3
                      }}
                    >
                      {developer.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      align="center"
                      color="primary.main"
                      sx={{
                        fontWeight: 600
                      }}
                    >
                      {developer.role}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" gutterBottom fontWeight="bold">
              Teknologi yang Digunakan
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Platform ini dibangun dengan teknologi modern untuk memberikan performa dan pengalaman terbaik.
            </Typography>

            <Box sx={{ mb: 4 }}>
              {technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  variant="outlined"
                  sx={{ m: 0.5 }}
                  color="primary"
                />
              ))}
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" gutterBottom fontWeight="bold">
              Ucapan Terima Kasih
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Kami mengucapkan terima kasih kepada:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Komunitas open-source yang telah menyediakan library dan tools berkualitas tinggi
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Para guru dan siswa yang telah memberikan masukan berharga untuk pengembangan platform
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Three.js, React, dan Supabase community untuk dokumentasi dan dukungan yang luar biasa
              </Typography>
              <Typography component="li" variant="body1">
                Seluruh pihak yang telah mendukung visi kami untuk meningkatkan pendidikan di Indonesia
              </Typography>
            </Box>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                © 2025 GeoCetak. Made with ❤️ for Indonesian Education
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  )
}

export default Credits