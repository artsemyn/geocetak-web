// src/components/3d/controls/ParameterControls.tsx
import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  Divider,
  Grid,
  Paper
} from '@mui/material'
import {
  Refresh,
  Calculate,
  ViewInAr,
  Animation
} from '@mui/icons-material'
import { useLearningStore } from '../../../stores/learningStore'
import { GeometryType } from '../../../types'
import { calculateGeometry } from '../../../utils/mathHelpers'

interface ParameterControlsProps {
  geometryType: GeometryType
}

export default function ParameterControls({ geometryType }: ParameterControlsProps) {
  const {
    geometryParams,
    showNetAnimation,
    updateGeometryParams,
    toggleNetAnimation
  } = useLearningStore()

  const calculations = calculateGeometry(geometryType, geometryParams)

  const handleParameterChange = (param: string) => (event: Event, newValue: number | number[]) => {
    updateGeometryParams({ [param]: newValue as number })
  }

  const resetParameters = () => {
    const defaultParams = {
      radius: 5,
      height: 10,
      slantHeight: 0
    }
    updateGeometryParams(defaultParams)
  }

  const getParameterConfig = () => {
    switch (geometryType) {
      case 'cylinder':
        return {
          title: 'Parameter Tabung',
          params: [
            {
              name: 'radius',
              label: 'Jari-jari (r)',
              min: 1,
              max: 10,
              step: 0.1,
              unit: 'cm',
              color: 'primary' as const
            },
            {
              name: 'height',
              label: 'Tinggi (t)',
              min: 2,
              max: 15,
              step: 0.1,
              unit: 'cm',
              color: 'secondary' as const
            }
          ]
        }

      case 'cone':
        return {
          title: 'Parameter Kerucut',
          params: [
            {
              name: 'radius',
              label: 'Jari-jari alas (r)',
              min: 1,
              max: 10,
              step: 0.1,
              unit: 'cm',
              color: 'primary' as const
            },
            {
              name: 'height',
              label: 'Tinggi (t)',
              min: 2,
              max: 15,
              step: 0.1,
              unit: 'cm',
              color: 'secondary' as const
            }
          ]
        }

      case 'sphere':
        return {
          title: 'Parameter Bola',
          params: [
            {
              name: 'radius',
              label: 'Jari-jari (r)',
              min: 1,
              max: 10,
              step: 0.1,
              unit: 'cm',
              color: 'primary' as const
            }
          ]
        }
    }
  }

  const config = getParameterConfig()

  return (
    <Box>
      {/* Parameter Controls */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              <ViewInAr sx={{ mr: 1, verticalAlign: 'middle' }} />
              {config.title}
            </Typography>
            <Button
              size="small"
              onClick={resetParameters}
              startIcon={<Refresh />}
              variant="outlined"
            >
              Reset
            </Button>
          </Box>

          {config.params.map((param) => (
            <Box key={param.name} mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  {param.label}
                </Typography>
                <Chip
                  label={`${geometryParams[param.name as keyof typeof geometryParams]?.toFixed(1)} ${param.unit}`}
                  size="small"
                  color={param.color}
                />
              </Box>
              <Slider
                value={geometryParams[param.name as keyof typeof geometryParams] || 0}
                min={param.min}
                max={param.max}
                step={param.step}
                onChange={handleParameterChange(param.name)}
                color={param.color}
                valueLabelDisplay="auto"
                marks={[
                  { value: param.min, label: param.min.toString() },
                  { value: param.max, label: param.max.toString() }
                ]}
              />
            </Box>
          ))}

          {/* Computed Values (for cone) */}
          {geometryType === 'cone' && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Nilai Terhitung
              </Typography>
              <Typography variant="body2">
                Garis Pelukis (s) = {calculations.slantHeight?.toFixed(2)} cm
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Dihitung dengan rumus: s = √(r² + t²)
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Animation Control */}
          <FormControlLabel
            control={
              <Switch
                checked={showNetAnimation}
                onChange={toggleNetAnimation}
                color="warning"
              />
            }
            label={
              <Box display="flex" alignItems="center">
                <Animation sx={{ mr: 1 }} />
                Mode Jaring-jaring
              </Box>
            }
          />
        </CardContent>
      </Card>

      {/* Dynamic Formulas */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            <Calculate sx={{ mr: 1, verticalAlign: 'middle' }} />
            Perhitungan Real-time
          </Typography>

          <Grid container spacing={2}>
            {/* Surface Area */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Luas Permukaan (L)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  {calculations.formula?.surfaceArea}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  {calculations.substitution?.surfaceArea}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  L = {calculations.surfaceArea.toFixed(2)} cm²
                </Typography>
              </Paper>
            </Grid>

            {/* Volume */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'white' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Volume (V)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  {calculations.formula?.volume}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  {calculations.substitution?.volume}
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  V = {calculations.volume.toFixed(2)} cm³
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Additional Info */}
          <Box mt={2}>
            <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
              ℹ️ Keterangan: Nilai π (pi) yang digunakan adalah 3.14 (pembulatan).
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              💡 Tip: Ubah parameter di atas untuk melihat bagaimana rumus berubah secara real-time!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}