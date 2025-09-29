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
import {
  Code,
  Palette,
  School,
  Psychology,
  Language
} from '@mui/icons-material'

const Credits: React.FC = () => {
  const teamMembers = [
    {
      name: "Tim Pengembang",
      role: "Full Stack Development",
      icon: <Code />,
      description: "Pengembangan aplikasi web dan integrasi sistem"
    },
    {
      name: "Tim Desain",
      role: "UI/UX Design",
      icon: <Palette />,
      description: "Perancangan antarmuka dan pengalaman pengguna"
    },
    {
      name: "Tim Pendidik",
      role: "Content Creation",
      icon: <School />,
      description: "Penyusunan materi pembelajaran geometri 3D"
    },
    {
      name: "Tim Riset",
      role: "Educational Research",
      icon: <Psychology />,
      description: "Penelitian metodologi pembelajaran interaktif"
    }
  ]

  const technologies = [
    "React", "TypeScript", "Three.js", "Material-UI", "Vite", "Supabase",
    "React Router", "Zustand", "React Spring", "React Three Fiber"
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          Credits
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
          GeoCetak - Platform Pembelajaran Geometri 3D Interaktif
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Tim Pengembang
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Aplikasi ini dikembangkan dengan dedikasi tinggi oleh tim multidisiplin untuk menciptakan
          pengalaman pembelajaran geometri 3D yang inovatif dan interaktif.
        </Typography>

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card elevation={1} sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {member.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {member.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2">
                    {member.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Teknologi yang Digunakan
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Aplikasi ini dibangun menggunakan teknologi modern dan terdepan dalam pengembangan web.
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
          Terima kasih kepada:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Seluruh komunitas open source yang telah menyediakan library dan framework yang luar biasa
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Para pendidik dan peneliti yang telah memberikan wawasan tentang metodologi pembelajaran
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Beta testers dan pengguna awal yang memberikan feedback berharga
          </Typography>
          <Typography component="li" variant="body1">
            Keluarga dan teman-teman yang memberikan dukungan selama proses pengembangan
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            © 2025 GeoCetak. Dibuat dengan ❤️ untuk kemajuan pendidikan Indonesia.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Credits