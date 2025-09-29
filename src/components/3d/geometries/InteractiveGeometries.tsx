// src/components/3d/geometries/InteractiveGeometries.tsx
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { useLearningStore } from '../../../stores/learningStore'
import { GeometryType } from '../../../types'

// Interactive Cylinder Component
export function InteractiveCylinder() {
  const meshRef = useRef<Mesh>(null)
  const { geometryParams } = useLearningStore()
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry 
        args={[geometryParams.radius, geometryParams.radius, geometryParams.height, 32]} 
      />
      <meshStandardMaterial 
        color="#4A90E2" 
        transparent 
        opacity={0.8}
        roughness={0.3}
        metalness={0.1}
      />
      {/* Wireframe overlay */}
      <meshBasicMaterial 
        color="#2C5AA0" 
        wireframe 
        transparent 
        opacity={0.2} 
      />
    </mesh>
  )
}

// Interactive Cone Component
export function InteractiveCone() {
  const meshRef = useRef<Mesh>(null)
  const { geometryParams } = useLearningStore()
  
  // Calculate slant height using Pythagorean theorem
  const slantHeight = Math.sqrt(
    Math.pow(geometryParams.radius, 2) + Math.pow(geometryParams.height, 2)
  )
  
  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <coneGeometry 
          args={[geometryParams.radius, geometryParams.height, 32]} 
        />
        <meshStandardMaterial 
          color="#E74C3C" 
          transparent 
          opacity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
        <meshBasicMaterial 
          color="#A93226" 
          wireframe 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      
      {/* Slant height indicator line */}
      <mesh position={[0, geometryParams.height/4, 0]} rotation={[0, 0, -Math.atan(geometryParams.height/geometryParams.radius)]}>
        <cylinderGeometry args={[0.05, 0.05, slantHeight, 8]} />
        <meshBasicMaterial color="#F39C12" />
      </mesh>
    </group>
  )
}

// Interactive Sphere Component
export function InteractiveSphere() {
  const meshRef = useRef<Mesh>(null)
  const { geometryParams } = useLearningStore()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2 // Slow rotation
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[geometryParams.radius, 32, 32]} />
      <meshStandardMaterial 
        color="#27AE60" 
        transparent 
        opacity={0.8}
        roughness={0.3}
        metalness={0.1}
      />
      <meshBasicMaterial 
        color="#1E8449" 
        wireframe 
        transparent 
        opacity={0.2} 
      />
    </mesh>
  )
}

// Net Animation Components
export function CylinderNet({ show }: { show: boolean }) {
  if (!show) return null

  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const circumference = 2 * Math.PI * radius

  return (
    <group position={[0, 0, 5]} rotation={[0, 0, 0]}>
      {/* Rectangle (unfolded side) - Main central piece, facing camera */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[circumference, height]} />
        <meshBasicMaterial color="#27AE60" side={2} />
      </mesh>

      {/* Top Circle - Now flat */}
      <mesh position={[0, height/2 + radius + 1, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0, radius, 32]} />
        <meshBasicMaterial color="#E74C3C" side={2} />
      </mesh>
      <mesh position={[0, height/2 + radius + 1, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#E74C3C" transparent opacity={0.3} side={2} />
      </mesh>

      {/* Bottom Circle - Now flat */}
      <mesh position={[0, -height/2 - radius - 1, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0, radius, 32]} />
        <meshBasicMaterial color="#E74C3C" side={2} />
      </mesh>
      <mesh position={[0, -height/2 - radius - 1, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#E74C3C" transparent opacity={0.3} side={2} />
      </mesh>

      {/* Connection lines to show how net folds */}
      <mesh position={[0, height/2 + radius/2 + 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
        <meshBasicMaterial color="#34495E" />
      </mesh>
      <mesh position={[0, -height/2 - radius/2 - 0.5, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
        <meshBasicMaterial color="#34495E" />
      </mesh>

      {/* Dimension labels */}
      <group position={[circumference/2 + 1, 0, 0]}>
        {/* Height indicator */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.02, 0.02, height, 8]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      </group>

      <group position={[0, -height/2 - radius - 2, 0]}>
        {/* Radius indicator */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
          <meshBasicMaterial color="#9B59B6" />
        </mesh>
      </group>
    </group>
  )
}

export function ConeNet({ show }: { show: boolean }) {
  if (!show) return null

  const { geometryParams } = useLearningStore()
  const { radius, height } = geometryParams
  const slantHeight = Math.sqrt(radius * radius + height * height)
  const sectorAngle = (2 * Math.PI * radius) / slantHeight

  return (
    <group position={[0, 0, 5]} rotation={[0, 0, 0]}>
      {/* Sector (fan shape) - main piece in center, facing camera */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0, slantHeight, 32, 0, sectorAngle]} />
        <meshBasicMaterial color="#27AE60" side={2} />
      </mesh>

      {/* Base Circle - positioned to the right side, facing camera */}
      <mesh position={[slantHeight + 2, -height/4, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0, radius, 32]} />
        <meshBasicMaterial color="#E74C3C" side={2} />
      </mesh>
      <mesh position={[slantHeight + 2, -height/4, 0]} rotation={[0, 0, 0]}>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial color="#E74C3C" transparent opacity={0.3} side={2} />
      </mesh>

      {/* Connection line from sector to circle */}
      <mesh position={[slantHeight/2 + 1, -height/8, 0]} rotation={[0, 0, -Math.PI/6]}>
        <cylinderGeometry args={[0.02, 0.02, slantHeight/2, 8]} />
        <meshBasicMaterial color="#34495E" />
      </mesh>

      {/* Dimension indicators */}
      <group position={[slantHeight/2, slantHeight/2, 0]}>
        {/* Slant height indicator */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI/4]}>
          <cylinderGeometry args={[0.02, 0.02, slantHeight, 8]} />
          <meshBasicMaterial color="#F39C12" />
        </mesh>
      </group>

      <group position={[slantHeight + 2, -height/4 - radius - 0.5, 0]}>
        {/* Radius indicator */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
          <meshBasicMaterial color="#9B59B6" />
        </mesh>
      </group>
    </group>
  )
}

export function SphereNet({ show }: { show: boolean }) {
  if (!show) return null

  const { geometryParams } = useLearningStore()
  const { radius } = geometryParams
  const segments = 6

  return (
    <group position={[0, 0, 5]} rotation={[0, 0, 0]}>
      {/* Orange peel segments - arranged in a horizontal line facing camera */}
      {Array.from({ length: segments }, (_, i) => {
        // Arrange segments horizontally in a line
        const x = (i - (segments - 1) / 2) * (radius * 1.5)
        const y = 0

        return (
          <mesh
            key={i}
            position={[x, y, 0]}
            rotation={[0, 0, 0]}
          >
            <sphereGeometry args={[radius * 0.6, 8, 16, 0, Math.PI / 3]} />
            <meshBasicMaterial
              color="#F39C12"
              transparent
              opacity={0.7}
              side={2}
            />
          </mesh>
        )
      })}

      {/* Connection lines between segments */}
      {Array.from({ length: segments - 1 }, (_, i) => {
        const x1 = (i - (segments - 1) / 2) * (radius * 1.5)
        const x2 = ((i + 1) - (segments - 1) / 2) * (radius * 1.5)
        const centerX = (x1 + x2) / 2
        const length = radius * 1.5

        return (
          <mesh
            key={i}
            position={[centerX, 0, 0]}
            rotation={[0, 0, Math.PI/2]}
          >
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshBasicMaterial color="#34495E" />
          </mesh>
        )
      })}

      {/* Dimension indicator */}
      <group position={[0, -radius - 1, 0]}>
        {/* Radius indicator */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, radius, 8]} />
          <meshBasicMaterial color="#9B59B6" />
        </mesh>
      </group>
    </group>
  )
}

// Main Geometry Renderer Component
interface GeometryRendererProps {
  type: GeometryType
  showNet: boolean
}

export function GeometryRenderer({ type, showNet }: GeometryRendererProps) {
  if (showNet) {
    switch (type) {
      case 'cylinder':
        return <CylinderNet show={showNet} />
      case 'cone':
        return <ConeNet show={showNet} />
      case 'sphere':
        return <SphereNet show={showNet} />
      default:
        return null
    }
  }

  switch (type) {
    case 'cylinder':
      return <InteractiveCylinder />
    case 'cone':
      return <InteractiveCone />
    case 'sphere':
      return <InteractiveSphere />
    default:
      return <InteractiveCylinder />
  }
}

// Scene Lighting Setup
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <directionalLight 
        position={[0, 10, 5]} 
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  )
}

// Background Environment
export function SceneEnvironment() {
  return (
    <>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#f0f0f0" transparent opacity={0.5} />
      </mesh>
    </>
  )
}