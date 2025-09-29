// src/components/ui/NotificationSystem.tsx
import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Box,
  IconButton,
  Typography
} from '@mui/material'
import { Close, CheckCircle, Error, Warning, Info } from '@mui/icons-material'
import { NotificationType, Notification } from '../../types'

// Notification Context
interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  hideNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

// Notification Provider
interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 3 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    // Auto remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id)
      }, newNotification.duration)
    }
  }, [maxNotifications])

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({
      type: 'success',
      title: title || 'Berhasil!',
      message,
      duration: 4000
    })
  }, [showNotification])

  const showError = useCallback((message: string, title?: string) => {
    showNotification({
      type: 'error',
      title: title || 'Terjadi Kesalahan',
      message,
      duration: 6000
    })
  }, [showNotification])

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({
      type: 'warning',
      title: title || 'Peringatan',
      message,
      duration: 5000
    })
  }, [showNotification])

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({
      type: 'info',
      title: title || 'Informasi',
      message,
      duration: 4000
    })
  }, [showNotification])

  return (
    <NotificationContext.Provider value={{
      showNotification,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideNotification
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />
    </NotificationContext.Provider>
  )
}

// Notification Container
interface NotificationContainerProps {
  notifications: Notification[]
  onHide: (id: string) => void
}

function NotificationContainer({ notifications, onHide }: NotificationContainerProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
        />
      ))}
    </Box>
  )
}

// Individual Notification Item
interface NotificationItemProps {
  notification: Notification
  onHide: (id: string) => void
}

function NotificationItem({ notification, onHide }: NotificationItemProps) {
  const [open, setOpen] = useState(true)

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => onHide(notification.id), 200) // Allow slide out animation
  }

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle />
      case 'error':
        return <Error />
      case 'warning':
        return <Warning />
      case 'info':
      default:
        return <Info />
    }
  }

  return (
    <Slide direction="left" in={open} mountOnEnter unmountOnExit>
      <Alert
        severity={notification.type}
        icon={getIcon(notification.type)}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleClose}
            sx={{ p: 0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          boxShadow: 3,
          border: 1,
          borderColor: `${notification.type}.light`,
        }}
      >
        {notification.title && (
          <AlertTitle>{notification.title}</AlertTitle>
        )}
        <Typography variant="body2">
          {notification.message}
        </Typography>
        
        {notification.actions && (
          <Box mt={1} display="flex" gap={1}>
            {notification.actions.map((action, index) => (
              <IconButton
                key={index}
                size="small"
                onClick={() => {
                  action.action()
                  handleClose()
                }}
                color="inherit"
              >
                {action.label}
              </IconButton>
            ))}
          </Box>
        )}
      </Alert>
    </Slide>
  )
}

// Achievement Notification (Special type)
interface AchievementNotificationProps {
  badge: {
    name: string
    description: string
    icon: string
  }
  xpEarned: number
  onClose: () => void
}

export function AchievementNotification({ 
  badge, 
  xpEarned, 
  onClose 
}: AchievementNotificationProps) {
  return (
    <Alert
      severity="success"
      icon={<Typography variant="h4">{badge.icon}</Typography>}
      action={
        <IconButton size="small" color="inherit" onClick={onClose}>
          <Close />
        </IconButton>
      }
      sx={{
        width: '100%',
        bgcolor: 'success.main',
        color: 'white',
        boxShadow: 4,
        border: '2px solid gold',
        '& .MuiAlert-icon': {
          color: 'white'
        }
      }}
    >
      <AlertTitle>🎉 Achievement Unlocked!</AlertTitle>
      <Typography variant="body2" fontWeight="bold">
        {badge.name}
      </Typography>
      <Typography variant="body2">
        {badge.description}
      </Typography>
      <Typography variant="caption">
        +{xpEarned} XP earned!
      </Typography>
    </Alert>
  )
}

// XP Notification (Quick floating notification)
interface XPNotificationProps {
  xp: number
  show: boolean
  onComplete: () => void
}

export function XPNotification({ xp, show, onComplete }: XPNotificationProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        pointerEvents: 'none',
        animation: 'floatUp 2s ease-out forwards'
      }}
    >
      <Box
        sx={{
          bgcolor: 'success.main',
          color: 'white',
          px: 3,
          py: 1.5,
          borderRadius: 2,
          boxShadow: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CheckCircle />
        <Typography variant="h6" fontWeight="bold">
          +{xp} XP
        </Typography>
      </Box>
      
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.8);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -60%) scale(1);
          }
        }
      `}</style>
    </Box>
  )
}

// Level Up Notification
interface LevelUpNotificationProps {
  newLevel: number
  show: boolean
  onComplete: () => void
}

export function LevelUpNotification({ 
  newLevel, 
  show, 
  onComplete 
}: LevelUpNotificationProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!show) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'levelUpFade 3s ease-out forwards'
      }}
    >
      <Box
        sx={{
          bgcolor: 'warning.main',
          color: 'white',
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          minWidth: 300,
          animation: 'levelUpBounce 0.6s ease-out'
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          🎉
        </Typography>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          LEVEL UP!
        </Typography>
        <Typography variant="h5" gutterBottom>
          Level {newLevel}
        </Typography>
        <Typography variant="body1">
          Selamat! Anda telah naik level!
        </Typography>
      </Box>
      
      <style>{`
        @keyframes levelUpFade {
          0%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes levelUpBounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </Box>
  )
}

// Hook untuk berbagai notifikasi
export function useGameNotifications() {
  const { showNotification } = useNotification()
  const [showXP, setShowXP] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [xpAmount, setXPAmount] = useState(0)
  const [newLevel, setNewLevel] = useState(1)

  const notifyXPEarned = useCallback((xp: number) => {
    setXPAmount(xp)
    setShowXP(true)
  }, [])

  const notifyLevelUp = useCallback((level: number) => {
    setNewLevel(level)
    setShowLevelUp(true)
  }, [])

  const notifyAchievement = useCallback((badge: any, xp: number) => {
    showNotification({
      type: 'success',
      title: '🏆 Achievement Unlocked!',
      message: `${badge.name}: ${badge.description} (+${xp} XP)`,
      duration: 6000
    })
  }, [showNotification])

  const notifyLessonComplete = useCallback((lessonTitle: string, xp: number) => {
    showNotification({
      type: 'success',
      title: '✅ Pelajaran Selesai!',
      message: `${lessonTitle} (+${xp} XP)`,
      duration: 4000
    })
    notifyXPEarned(xp)
  }, [showNotification, notifyXPEarned])

  return {
    // XP Notifications
    showXP,
    xpAmount,
    notifyXPEarned,
    hideXPNotification: () => setShowXP(false),
    
    // Level Up
    showLevelUp,
    newLevel,
    notifyLevelUp,
    hideLevelUpNotification: () => setShowLevelUp(false),
    
    // Achievement & Lesson
    notifyAchievement,
    notifyLessonComplete
  }
}