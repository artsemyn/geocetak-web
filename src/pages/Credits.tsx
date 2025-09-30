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
import Navbar from '../components/Navbar'

const Credits: React.FC = () => {
  const teamMembers = [
    {
      name: "Lorem Ipsum",
      role: "Lorem Development",
      icon: <Code />,
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      name: "Lorem Ipsum",
      role: "Lorem Design",
      icon: <Palette />,
      description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      name: "Lorem Ipsum",
      role: "Lorem Creation",
      icon: <School />,
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco."
    },
    {
      name: "Lorem Ipsum",
      role: "Lorem Research",
      icon: <Psychology />,
      description: "Duis aute irure dolor in reprehenderit in voluptate velit."
    }
  ]

  const technologies = [
    "Lorem", "Ipsum", "Dolor", "Sit", "Amet", "Consectetur",
    "Adipiscing", "Elit", "Tempor", "Incididunt"
  ]

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          Lorem Ipsum
        </Typography>
        <Typography variant="h6" color="textSecondary" align="center" sx={{ mb: 4 }}>
          Lorem Ipsum - Dolor Sit Amet Consectetur
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom fontWeight="bold">
          Lorem Ipsum
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>

        <Grid 
          container 
          spacing={3} 
          sx={{ mb: 5 }} 
          justifyContent="center"
        >
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
          Lorem Ipsum Dolor
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
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
          Lorem Ipsum
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Sed ut perspiciatis unde omnis:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet
          </Typography>
          <Typography component="li" variant="body1" sx={{ mb: 1 }}>
            Ut enim ad minima veniam, quis nostrum exercitationem
          </Typography>
          <Typography component="li" variant="body1">
            Quis autem vel eum iure reprehenderit qui in ea voluptate
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            © 2025 Lorem Ipsum. Dolor sit amet ❤️ consectetur adipiscing elit.
          </Typography>
        </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Credits