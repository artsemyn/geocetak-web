// Enhanced Net Visualization Component - 3D Only
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Box } from '@mui/material'
import { useLearningStore } from '../../../stores/learningStore'

// 3D Net Components
const CylinderNet3D: React.FC = () => {
  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const circumference = 2 * Math.PI * radius
  const scale = 0.3

  return (
    <group scale={[scale, scale, scale]} position={[0, 0, 0]}>
      {/* Main rectangle (selimut) - centered */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[circumference, height]} />
        <meshBasicMaterial color="#4A90E2" side={2} transparent opacity={0.8} />
      </mesh>

      {/* Rectangle border */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[circumference + 0.1, height + 0.1]} />
        <meshBasicMaterial color="#2C5AA0" wireframe side={2} />
      </mesh>

      {/* Top circle - touching the top edge of selimut */}
      <mesh position={[0, height / 2 + radius, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#2196F3" side={2} />
      </mesh>
      <mesh position={[0, height / 2 + radius, 0.01]}>
        <ringGeometry args={[radius - 0.05, radius, 32]} />
        <meshBasicMaterial color="#1565C0" side={2} />
      </mesh>

      {/* Bottom circle - touching the bottom edge of selimut */}
      <mesh position={[0, -height / 2 - radius, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#4CAF50" side={2} />
      </mesh>
      <mesh position={[0, -height / 2 - radius, 0.01]}>
        <ringGeometry args={[radius - 0.05, radius, 32]} />
        <meshBasicMaterial color="#2E7D32" side={2} />
      </mesh>

    </group>
  )
}

const ConeNet3D: React.FC = () => {
  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const slantHeight = Math.sqrt(radius * radius + height * height)
  const sectorAngle = (2 * Math.PI * radius) / slantHeight
  const scale = 0.3

  // Calculate total height of cone net (sector + circle, no gap)
  const totalHeight = slantHeight + radius
  const offsetY = totalHeight / 2

  // Position circle right below the sector, no gap
  const circleY = -slantHeight - radius

  return (
    <group scale={[scale, scale, scale]} position={[0, 0.6, 0]}>
      {/* Sector (fan shape) - centered so it expands symmetrically */}
      <mesh position={[0, 0, 0]} rotation={[4.7 - Math.PI / 2, 0, 1.57 - sectorAngle / 2]}>
        <ringGeometry args={[0, slantHeight, 32, 0, 0, sectorAngle]} />
        <meshBasicMaterial color="#E74C3C" side={2} />
      </mesh>

      {/* Base circle - positioned below sector, always touching */}
      <mesh position={[0, circleY, 0]} rotation={[3.13, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#FFC107" side={2} />
      </mesh>
    </group>
  )
}

const SphereNet3D: React.FC = () => {
  const { geometryParams } = useLearningStore()
  const { radius } = geometryParams
  const scale = 0.3

  return (
    <group scale={[scale, scale, scale]}>
      {/* Orange peel segments arranged in a circle */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8
        const distance = radius + 3
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance
        const color = `hsl(${i * 45}, 70%, 60%)`

        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            rotation={[0, angle + Math.PI/2, 0]}
          >
            <sphereGeometry args={[radius * 0.6, 16, 16, 0, Math.PI/4]} />
            <meshBasicMaterial color={color} side={2} transparent opacity={0.8} />
          </mesh>
        )
      })}

      {/* Center reference */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#333" />
      </mesh>
    </group>
  )
}

// Main Net Visualization Component
interface NetVisualizationProps {
  geometryType: 'cylinder' | 'cone' | 'sphere'
  show: boolean
}

export const EnhancedNetVisualization: React.FC<NetVisualizationProps> = ({
  geometryType,
  show
}) => {
  if (!show) return null

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {geometryType === 'cylinder' && <CylinderNet3D />}
        {geometryType === 'cone' && <ConeNet3D />}
        {geometryType === 'sphere' && <SphereNet3D />}

        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </Box>
  )
}
