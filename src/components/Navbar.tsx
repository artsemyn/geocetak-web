// src/components/Navbar.tsx
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Chip,
  Button,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Calculate,
  Person,
  Logout,
  Settings,
  EmojiEvents,
  Dashboard as DashboardIcon,
  School,
  Assignment,
  Build,
  Article,
  Menu as MenuIcon,
  ViewInAr,
  Info
} from '@mui/icons-material'
import { useAuthStore } from '../stores/authStore'
import { useLearningStore } from '../stores/learningStore'

interface NavbarProps {
  showNav?: boolean
  showUserStats?: boolean
  showLevelProgress?: boolean
}

export default function Navbar({
  showNav = true,
  showUserStats = true,
  showLevelProgress = true
}: NavbarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { user, profile, signOut } = useAuthStore()
  const { userStats, resetStore } = useLearningStore()

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMobileMenu = () => {
    setMobileMenuAnchorEl(null)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      resetStore()
      console.log('User signed out successfully')
      handleCloseMenu()
    } catch (error) {
      console.error('Error signing out:', error)
      resetStore()
      handleCloseMenu()
    }
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    handleCloseMobileMenu()
  }

  // Calculate level progress
  const currentLevelXp = userStats ? userStats.total_xp % 500 : 0
  const levelProgress = (currentLevelXp / 500) * 100

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        bgcolor: 'primary.main',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        '& .MuiToolbar-root': {
          minHeight: '64px'
        }
      }}
    >
      <Toolbar>
        {/* Logo Section */}
        <Box display="flex" alignItems="center">
          <Calculate sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            GeoCetak
          </Typography>
        </Box>

        {/* Centered Navigation Menu */}
        {showNav && (
          <Box flexGrow={1} display="flex" justifyContent="center">
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/')}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  startIcon={<School />}
                  onClick={() => navigate('/modules')}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === '/modules' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Modul
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Assignment />}
                  onClick={() => navigate('/assessment')}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === '/assessment' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Assessment
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Build />}
                  onClick={() => navigate('/three-editor')}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === '/three-editor' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  3D Editor
                </Button>
                <Button
                  color="inherit"
                  startIcon={<Article />}
                  onClick={() => navigate('/credits')}
                  sx={{
                    color: 'white',
                    backgroundColor: location.pathname === '/credits' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Credits
                </Button>
              </Stack>
            )}
          </Box>
        )}

        {!showNav && <Box flexGrow={1} />}

        {/* Right Section */}
        <Box display="flex" alignItems="center">
          {/* Mobile Navigation Menu Button */}
          {isMobile && showNav && (
            <IconButton
              color="inherit"
              onClick={handleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* User Stats */}
          {showUserStats && userStats && (
            <Box display="flex" alignItems="center" gap={2} mr={2}>
              <Chip
                icon={<EmojiEvents />}
                label={`Level ${userStats.level}`}
                color="secondary"
                size="small"
              />
              <Chip
                label={`${userStats.total_xp} XP`}
                variant="outlined"
                size="small"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
            </Box>
          )}

          {/* Profile Menu */}
          <IconButton onClick={handleProfileMenu} color="inherit">
            <Avatar
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || 'User'}
              sx={{ width: 32, height: 32 }}
            >
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleCloseMenu(); }}>
            <Person sx={{ mr: 2 }} />
            Profile & Settings
          </MenuItem>
          <MenuItem onClick={() => { navigate('/my-models'); handleCloseMenu(); }}>
            <ViewInAr sx={{ mr: 2 }} />
            Model Saya
          </MenuItem>
          <MenuItem onClick={() => { navigate('/credits'); handleCloseMenu(); }}>
            <Info sx={{ mr: 2 }} />
            Credits
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <Logout sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* Mobile Navigation Menu */}
        {showNav && (
          <Menu
            anchorEl={mobileMenuAnchorEl}
            open={Boolean(mobileMenuAnchorEl)}
            onClose={handleCloseMobileMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleNavigate('/')}>
              <DashboardIcon sx={{ mr: 2 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/modules')}>
              <School sx={{ mr: 2 }} />
              Modul
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/assessment')}>
              <Assignment sx={{ mr: 2 }} />
              Assessment
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/three-editor')}>
              <Build sx={{ mr: 2 }} />
              3D Editor
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/credits')}>
              <Article sx={{ mr: 2 }} />
              Credits
            </MenuItem>
          </Menu>
        )}
      </Toolbar>

      {/* Level Progress Bar */}
      {showLevelProgress && userStats && (
        <LinearProgress
          variant="determinate"
          value={levelProgress}
          sx={{
            height: 3,
            '& .MuiLinearProgress-bar': {
              bgcolor: 'secondary.main'
            }
          }}
        />
      )}
    </AppBar>
  )
}