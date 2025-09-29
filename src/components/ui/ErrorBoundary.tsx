// src/components/ui/ErrorBoundary.tsx
import React from 'react'
import { Box, Typography, Button, Paper, Alert } from '@mui/material'
import { Refresh, BugReport, Home } from '@mui/icons-material'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
    
    // TODO: Send to error reporting service in production
    // logErrorToService(error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

// Default Error Fallback Component
interface ErrorFallbackProps {
  error?: Error
  retry: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      p={3}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
        <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
          Oops! Terjadi Kesalahan
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          Maaf, terjadi kesalahan tak terduga dalam aplikasi. Tim kami telah diberitahu dan sedang memperbaikinya.
        </Typography>

        {isDevelopment && error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
              {error.message}
            </Typography>
          </Alert>
        )}

        <Box display="flex" gap={2} justifyContent="center" mt={3}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={retry}
            color="primary"
          >
            Coba Lagi
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => window.location.href = '/'}
          >
            Kembali ke Beranda
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

// 3D Scene Error Fallback
export function Scene3DErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      bgcolor="grey.100"
      p={3}
    >
      <BugReport sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h6" fontWeight="bold" gutterBottom color="error">
        Gagal Memuat Scene 3D
      </Typography>
      
      <Typography variant="body2" color="textSecondary" textAlign="center" paragraph>
        Browser Anda mungkin tidak mendukung WebGL atau terjadi masalah rendering.
      </Typography>

      <Button
        variant="contained"
        size="small"
        startIcon={<Refresh />}
        onClick={retry}
      >
        Muat Ulang
      </Button>
    </Box>
  )
}

// Loading Components
export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={3}
    >
      <div className="spinner" style={{ 
        width: 40, 
        height: 40, 
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #1976d2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 16
      }} />
      <Typography variant="body2" color="textSecondary">
        {message}
      </Typography>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}

export function PageLoading() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
    >
      <LoadingSpinner message="Memuat halaman..." />
    </Box>
  )
}

export function Scene3DLoading() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100%"
      bgcolor="grey.50"
    >
      <LoadingSpinner message="Memuat scene 3D..." />
    </Box>
  )
}

// Skeleton Loaders
export function ModuleCardSkeleton() {
  return (
    <Paper sx={{ p: 2, height: 300 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 60,
            height: 60,
            bgcolor: 'grey.300',
            borderRadius: 1,
            mr: 2,
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
        <Box flexGrow={1}>
          <Box
            sx={{
              height: 20,
              bgcolor: 'grey.300',
              borderRadius: 1,
              mb: 1,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
          <Box
            sx={{
              height: 16,
              bgcolor: 'grey.200',
              borderRadius: 1,
              width: '80%',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </Box>
      </Box>
      
      <Box
        sx={{
          height: 8,
          bgcolor: 'grey.200',
          borderRadius: 4,
          mb: 2,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
      
      <Box
        sx={{
          height: 40,
          bgcolor: 'grey.300',
          borderRadius: 1,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Paper>
  )
}

export function DashboardSkeleton() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Box
        sx={{
          height: 120,
          bgcolor: 'grey.300',
          borderRadius: 2,
          mb: 3,
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
      
      {/* Stats Cards Skeleton */}
      <Box display="flex" gap={3} mb={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 100,
              bgcolor: 'grey.200',
              borderRadius: 1,
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        ))}
      </Box>
      
      {/* Module Cards Skeleton */}
      <Box display="flex" gap={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Box key={i} sx={{ flex: 1 }}>
            <ModuleCardSkeleton />
          </Box>
        ))}
      </Box>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Box>
  )
}