// src/components/3d/Scene3D.tsx
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Stats } from '@react-three/drei'
import { Box, CircularProgress, Typography } from '@mui/material'
import { GeometryRenderer, SceneLighting, SceneEnvironment } from './geometries/InteractiveGeometries'
import { GeometryType } from '../../types'

interface Scene3DProps {
  geometryType: GeometryType
  showNet: boolean
  showStats?: boolean
  enableControls?: boolean
  cameraPosition?: [number, number, number]
}

function LoadingFallback() {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      alignItems="center" 
      justifyContent="center" 
      height="100%"
      bgcolor="grey.100"
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body2" color="textSecondary">
        Loading 3D Scene...
      </Typography>
    </Box>
  )
}

export default function Scene3D({ 
  geometryType, 
  showNet, 
  showStats = false,
  enableControls = true,
  cameraPosition = [10, 5, 10]
}: Scene3DProps) {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ 
            position: cameraPosition, 
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          shadows
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]} // Responsive pixel ratio
        >
          {/* Lighting Setup */}
          <SceneLighting />
          
          {/* Main Geometry */}
          <Suspense fallback={null}>
            <GeometryRenderer type={geometryType} showNet={showNet} />
          </Suspense>
          
          {/* Environment */}
          <SceneEnvironment />
          
          {/* Grid Helper */}
          <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={50}
            fadeStrength={1}
          />
          
          {/* Controls */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2 + 0.5}
            />
          )}
          
          {/* Gizmo Helper */}
          <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
            <GizmoViewport 
              axisColors={['#E74C3C', '#27AE60', '#3498DB']} 
              labelColor="black" 
            />
          </GizmoHelper>
          
          {/* Performance Stats (Development) */}
          {showStats && process.env.NODE_ENV === 'development' && <Stats />}
        </Canvas>
      </Suspense>
    </Box>
  )
}