// src/pages/ChatBotPage.tsx
import React, { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Container,
  Avatar,
} from '@mui/material'
import { Send, SmartToy } from '@mui/icons-material'
import { getChatResponse } from '../services/geminiService'
import Navbar from '../components/Navbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  text: string
  isBot: boolean
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Halo! Saya GeoCetak AI Assistant. Saya siap membantu Anda mempelajari geometri 3D. Ada yang bisa saya bantu?',
      isBot: true,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }])
    setIsLoading(true)

    try {
      const response = await getChatResponse(userMessage)
      setMessages((prev) => [...prev, { text: response, isBot: true }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: 'Maaf, terjadi kesalahan. Silakan coba lagi.', isBot: true },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper sx={{ p: 4, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2, width: 56, height: 56 }}>
              <SmartToy fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                GeoCetak AI Assistant
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Tanyakan apa saja tentang geometri 3D, rumus, konsep, atau soal latihan
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Chat Container */}
        <Paper
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
          elevation={3}
        >
          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.isBot ? 'flex-start' : 'flex-end',
                  mb: 2,
                }}
              >
                {message.isBot && (
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1, mt: 0.5 }}>
                    <SmartToy fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.isBot ? 'grey.100' : 'primary.main',
                    color: message.isBot ? 'text.primary' : 'white',
                    maxWidth: '70%',
                    borderRadius: 2,
                    '& table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      marginTop: 1,
                      marginBottom: 1,
                    },
                    '& th, & td': {
                      border: '1px solid',
                      borderColor: message.isBot ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.3)',
                      padding: '8px 12px',
                      textAlign: 'left',
                    },
                    '& th': {
                      backgroundColor: message.isBot ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.1)',
                      fontWeight: 'bold',
                    },
                    '& ul, & ol': {
                      marginTop: 0.5,
                      marginBottom: 0.5,
                      paddingLeft: 2,
                    },
                    '& p': {
                      marginTop: 0.5,
                      marginBottom: 0.5,
                    },
                  }}
                  elevation={message.isBot ? 0 : 2}
                >
                  {message.isBot ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <Typography variant="body1" component="p" sx={{ my: 0.5 }}>
                            {children}
                          </Typography>
                        ),
                        li: ({ children }) => (
                          <Typography variant="body2" component="li">
                            {children}
                          </Typography>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <SmartToy fontSize="small" />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <CircularProgress size={24} />
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 3, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ketik pertanyaan Anda di sini..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                multiline
                maxRows={4}
                variant="outlined"
              />
              <IconButton
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                color="primary"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&.Mui-disabled': { bgcolor: 'grey.300' },
                }}
              >
                <Send />
              </IconButton>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
