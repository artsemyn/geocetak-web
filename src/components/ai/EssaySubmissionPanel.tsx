// src/components/ai/EssaySubmissionPanel.tsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AIIcon,
  Assignment as AssignmentIcon,
  Timer as TimerIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material'
import { aiAssessmentService, type EvaluationRequest, type EvaluationResponse } from '../../services/aiAssessmentService'
import { useLearningStore } from '../../stores/learningStore'
import { useAuthStore } from '../../stores/authStore'

interface EssaySubmissionPanelProps {
  lessonId: string
  geometryType: 'cylinder' | 'cone' | 'sphere'
  problemText: string
  onEvaluationComplete?: (response: EvaluationResponse) => void
}

export const EssaySubmissionPanel: React.FC<EssaySubmissionPanelProps> = ({
  lessonId,
  geometryType,
  problemText,
  onEvaluationComplete
}) => {
  const [studentAnswer, setStudentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState(0)
  
  const { user } = useAuthStore()
  const { trackActivity } = useLearningStore()

  // Update word count
  useEffect(() => {
    const words = studentAnswer.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [studentAnswer])

  const handleSubmit = async () => {
    if (!studentAnswer.trim()) {
      setError('Mohon tulis jawaban Anda terlebih dahulu')
      return
    }

    if (wordCount < 20) {
      setError('Jawaban terlalu pendek. Mohon berikan penjelasan yang lebih detail (minimal 20 kata)')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const request: EvaluationRequest = {
        problemText,
        studentAnswer,
        lessonId,
        geometryType
      }

      const result = await aiAssessmentService.submitForEvaluation(request)
      setEvaluationResult(result)
      
      // Track activity in learning store
      trackActivity({
        type: 'ai_assessment',
        lessonId,
        metadata: {
          score: result.feedback.overallScore,
          processingTime: result.processingTimeMs,
          wordCount
        }
      })

      onEvaluationComplete?.(result)

    } catch (err) {
      console.error('Essay evaluation error:', err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengevaluasi jawaban')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'success'
    if (score >= 70) return 'primary' 
    if (score >= 60) return 'warning'
    return 'error'
  }

  const getCriteriaLabel = (criteria: string) => {
    const labels: Record<string, string> = {
      'mathematical_accuracy': 'Ketepatan Matematika',
      'conceptual_understanding': 'Pemahaman Konsep',
      'problem_solving_approach': 'Pendekatan Pemecahan Masalah',
      'communication': 'Komunikasi Matematika'
    }
    return labels[criteria] || criteria
  }

  const getCriteriaScore = (score: number) => {
    const levels = ['Perlu Perbaikan', 'Cukup', 'Baik', 'Sangat Baik']
    return levels[score - 1] || 'Tidak Valid'
  }

  if (evaluationResult) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AIIcon color="primary" />
          <Typography variant="h6">
            Hasil Evaluasi AI
          </Typography>
          <Chip 
            label={`${evaluationResult.feedback.overallScore}/100`}
            color={getScoreColor(evaluationResult.feedback.overallScore)}
            size="large"
          />
          <Chip 
            icon={<TimerIcon />}
            label={`${(evaluationResult.processingTimeMs / 1000).toFixed(1)}s`}
            variant="outlined" 
            size="small"
          />
        </Box>

        {/* Overall Feedback */}
        <Alert 
          severity={evaluationResult.feedback.overallScore >= 70 ? 'success' : 'info'}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Feedback Keseluruhan:</strong>
          </Typography>
          <Typography variant="body2">
            {evaluationResult.feedback.detailedFeedback}
          </Typography>
        </Alert>

        {/* Criteria Breakdown */}
        <Typography variant="h6" gutterBottom>
          Detail Penilaian
        </Typography>
        <Box sx={{ mb: 3 }}>
          {Object.entries(evaluationResult.feedback.criteriaScores).map(([criteria, score]) => (
            <Box key={criteria} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  {getCriteriaLabel(criteria)}
                </Typography>
                <Chip 
                  label={getCriteriaScore(score)}
                  color={score >= 3 ? 'success' : score >= 2 ? 'primary' : 'warning'}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(score / 4) * 100}
                color={score >= 3 ? 'success' : score >= 2 ? 'primary' : 'warning'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Box>

        {/* Strengths and Improvements */}
        <Box display="flex" gap={2} mb={3}>
          <Box flex={1}>
            <Typography variant="h6" color="success.main" gutterBottom>
              ✅ Kelebihan
            </Typography>
            {evaluationResult.feedback.strengths.map((strength, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                • {strength}
              </Typography>
            ))}
          </Box>
          
          <Box flex={1}>
            <Typography variant="h6" color="warning.main" gutterBottom>
              📈 Area Perbaikan
            </Typography>
            {evaluationResult.feedback.improvements.map((improvement, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                • {improvement}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Next Steps */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Langkah Belajar Selanjutnya
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {evaluationResult.feedback.nextSteps.map((step, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                {index + 1}. {step}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Chain of Thought (Advanced) */}
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              🔍 Proses Berpikir AI (Advanced)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {evaluationResult.reasoning.map((step, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Langkah {step.step}: 
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {step.reasoning}
                </Typography>
                <Typography variant="body2" color="primary.main">
                  <strong>Temuan:</strong> {step.finding}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={step.confidence * 100}
                  sx={{ mt: 1, height: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Tingkat keyakinan: {(step.confidence * 100).toFixed(0)}%
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box display="flex" gap={2} mt={3}>
          <Button 
            variant="outlined" 
            onClick={() => {
              setEvaluationResult(null)
              setStudentAnswer('')
              setWordCount(0)
            }}
          >
            Coba Lagi
          </Button>
          <Button 
            variant="contained"
            onClick={() => window.print()}
          >
            Simpan Hasil
          </Button>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <AssignmentIcon color="primary" />
        <Typography variant="h6">
          Tugas Essay: Analisis {geometryType === 'cylinder' ? 'Tabung' : geometryType === 'cone' ? 'Kerucut' : 'Bola'}
        </Typography>
      </Box>

      {/* Problem Statement */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="body1" fontWeight="medium" color="primary.main" gutterBottom>
          Soal:
        </Typography>
        <Typography variant="body1">
          {problemText}
        </Typography>
      </Paper>

      {/* Essay Input */}
      <Box mb={3}>
        <Typography variant="body1" fontWeight="medium" gutterBottom>
          Tuliskan jawaban Anda:
        </Typography>
        <TextField
          multiline
          rows={8}
          fullWidth
          value={studentAnswer}
          onChange={(e) => setStudentAnswer(e.target.value)}
          placeholder="Jelaskan langkah-langkah penyelesaian dengan detail. Sertakan rumus yang digunakan, perhitungan, dan penjelasan konsep yang relevan..."
          disabled={isSubmitting}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1rem',
              lineHeight: 1.5
            }
          }}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Jumlah kata: {wordCount} (minimal 20 kata)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Tip: Jelaskan rumus, perhitungan, dan hubungan dengan kehidupan sehari-hari
          </Typography>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Guidelines */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">
            💡 Panduan Menjawab
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            <strong>Jawaban yang baik harus mencakup:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            • <strong>Identifikasi:</strong> Sebutkan rumus yang relevan<br/>
            • <strong>Perhitungan:</strong> Tunjukkan langkah-langkah dengan jelas<br/>
            • <strong>Penjelasan:</strong> Jelaskan mengapa menggunakan rumus tersebut<br/>
            • <strong>Konteks:</strong> Hubungkan dengan contoh nyata<br/>
            • <strong>Kesimpulan:</strong> Ringkas hasil dan maknanya
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Submit Button */}
      <Box display="flex" justifyContent="center">
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting || wordCount < 20}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <AIIcon />}
          sx={{ minWidth: 200 }}
        >
          {isSubmitting ? 'Mengevaluasi...' : 'Kirim untuk Evaluasi AI'}
        </Button>
      </Box>

      {isSubmitting && (
        <Box mt={3}>
          <Typography variant="body2" textAlign="center" color="text.secondary" gutterBottom>
            AI sedang menganalisis jawaban Anda...
          </Typography>
          <LinearProgress />
        </Box>
      )}
    </Paper>
  )
}