// src/utils/mathHelpers.ts
import { GeometryType, GeometryParameters, GeometryCalculations } from '../types'

/**
 * Calculate geometry properties based on type and parameters
 */
export function calculateGeometry(
  type: GeometryType, 
  params: GeometryParameters
): GeometryCalculations & {
  formula: { surfaceArea: string; volume: string }
  substitution: { surfaceArea: string; volume: string }
  slantHeight?: number
} {
  const { radius, height } = params

  switch (type) {
    case 'cylinder':
      return calculateCylinder(radius, height)
    
    case 'cone':
      return calculateCone(radius, height)
    
    case 'sphere':
      return calculateSphere(radius)
    
    default:
      return calculateCylinder(radius, height)
  }
}

/**
 * Calculate cylinder properties
 */
function calculateCylinder(radius: number, height: number): GeometryCalculations & {
  formula: { surfaceArea: string; volume: string }
  substitution: { surfaceArea: string; volume: string }
} {
  // Calculations
  const surfaceArea = 2 * Math.PI * radius * (radius + height)
  const volume = Math.PI * Math.pow(radius, 2) * height

  // Net components
  const netComponents = [
    {
      type: 'circle' as const,
      dimensions: { radius },
      position: [0, height/2 + 3, 0] as [number, number, number],
      label: 'Tutup Atas'
    },
    {
      type: 'circle' as const,
      dimensions: { radius },
      position: [0, -height/2 - 3, 0] as [number, number, number],
      label: 'Alas Bawah'
    },
    {
      type: 'rectangle' as const,
      dimensions: { 
        width: 2 * Math.PI * radius, 
        height: height 
      },
      position: [radius + 4, 0, 0] as [number, number, number],
      label: 'Selimut Tabung'
    }
  ]

  return {
    surfaceArea,
    volume,
    netComponents,
    formula: {
      surfaceArea: 'L = 2πr(r + t)',
      volume: 'V = πr²t'
    },
    substitution: {
      surfaceArea: `L = 2π(${radius.toFixed(1)})(${radius.toFixed(1)} + ${height.toFixed(1)})`,
      volume: `V = π(${radius.toFixed(1)})²(${height.toFixed(1)})`
    }
  }
}

/**
 * Calculate cone properties
 */
function calculateCone(radius: number, height: number): GeometryCalculations & {
  formula: { surfaceArea: string; volume: string }
  substitution: { surfaceArea: string; volume: string }
  slantHeight: number
} {
  // Calculate slant height using Pythagorean theorem
  const slantHeight = Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2))
  
  // Calculations
  const surfaceArea = Math.PI * radius * (radius + slantHeight)
  const volume = (1/3) * Math.PI * Math.pow(radius, 2) * height

  // Net components
  const netComponents = [
    {
      type: 'circle' as const,
      dimensions: { radius },
      position: [0, -height/2 - 3, 0] as [number, number, number],
      label: 'Alas Lingkaran'
    },
    {
      type: 'sector' as const,
      dimensions: { 
        radius: slantHeight, 
        angle: (2 * Math.PI * radius) / slantHeight 
      },
      position: [slantHeight + 2, 0, 0] as [number, number, number],
      label: 'Selimut (Juring)'
    }
  ]

  return {
    surfaceArea,
    volume,
    netComponents,
    slantHeight,
    formula: {
      surfaceArea: 'L = πr(r + s)',
      volume: 'V = ⅓πr²t'
    },
    substitution: {
      surfaceArea: `L = π(${radius.toFixed(1)})(${radius.toFixed(1)} + ${slantHeight.toFixed(1)})`,
      volume: `V = ⅓π(${radius.toFixed(1)})²(${height.toFixed(1)})`
    }
  }
}

/**
 * Calculate sphere properties
 */
function calculateSphere(radius: number): GeometryCalculations & {
  formula: { surfaceArea: string; volume: string }
  substitution: { surfaceArea: string; volume: string }
} {
  // Calculations
  const surfaceArea = 4 * Math.PI * Math.pow(radius, 2)
  const volume = (4/3) * Math.PI * Math.pow(radius, 3)

  // Net components (orange peel segments)
  const segments = 8
  const netComponents = Array.from({ length: segments }, (_, i) => ({
    type: 'triangle' as const,
    dimensions: { 
      base: 2 * Math.PI * radius / segments,
      height: Math.PI * radius 
    },
    position: [
      Math.cos((i / segments) * Math.PI * 2) * (radius + 2),
      0,
      Math.sin((i / segments) * Math.PI * 2) * (radius + 2)
    ] as [number, number, number],
    label: `Segmen ${i + 1}`
  }))

  return {
    surfaceArea,
    volume,
    netComponents,
    formula: {
      surfaceArea: 'L = 4πr²',
      volume: 'V = ⁴⁄₃πr³'
    },
    substitution: {
      surfaceArea: `L = 4π(${radius.toFixed(1)})²`,
      volume: `V = ⁴⁄₃π(${radius.toFixed(1)})³`
    }
  }
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Format number to specified decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  return (value / total) * 100
}

/**
 * Validate geometry parameters
 */
export function validateGeometryParams(
  type: GeometryType, 
  params: GeometryParameters
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Common validations
  if (params.radius <= 0) {
    errors.push('Jari-jari harus lebih besar dari 0')
  }
  
  if (params.radius > 20) {
    errors.push('Jari-jari terlalu besar (maksimal 20)')
  }

  // Type-specific validations
  if (type === 'cylinder' || type === 'cone') {
    if (params.height <= 0) {
      errors.push('Tinggi harus lebih besar dari 0')
    }
    
    if (params.height > 30) {
      errors.push('Tinggi terlalu besar (maksimal 30)')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate practice problems
 */
export function generatePracticeProblems(type: GeometryType, difficulty: 'easy' | 'medium' | 'hard') {
  const problems = []
  
  for (let i = 0; i < 5; i++) {
    let radius: number
    let height: number
    
    switch (difficulty) {
      case 'easy':
        radius = Math.floor(Math.random() * 5) + 1 // 1-5
        height = Math.floor(Math.random() * 8) + 2 // 2-10
        break
      case 'medium':
        radius = Math.floor(Math.random() * 8) + 3 // 3-10
        height = Math.floor(Math.random() * 12) + 5 // 5-16
        break
      case 'hard':
        radius = Math.random() * 10 + 2 // 2-12 (decimal)
        height = Math.random() * 15 + 3 // 3-18 (decimal)
        radius = Math.round(radius * 10) / 10
        height = Math.round(height * 10) / 10
        break
    }

    const calculations = calculateGeometry(type, { radius, height })
    
    problems.push({
      id: `${type}_${difficulty}_${i + 1}`,
      type,
      difficulty,
      parameters: { radius, height },
      question: generateQuestionText(type, radius, height),
      answer: {
        surfaceArea: calculations.surfaceArea,
        volume: calculations.volume
      },
      solution: generateSolutionSteps(type, radius, height, calculations)
    })
  }
  
  return problems
}

function generateQuestionText(type: GeometryType, radius: number, height: number): string {
  const typeNames = {
    cylinder: 'tabung',
    cone: 'kerucut', 
    sphere: 'bola'
  }
  
  const typeName = typeNames[type]
  
  if (type === 'sphere') {
    return `Sebuah ${typeName} memiliki jari-jari ${radius} cm. Hitunglah luas permukaan dan volume ${typeName} tersebut!`
  }
  
  return `Sebuah ${typeName} memiliki jari-jari ${radius} cm dan tinggi ${height} cm. Hitunglah luas permukaan dan volume ${typeName} tersebut!`
}

function generateSolutionSteps(
  type: GeometryType, 
  radius: number, 
  height: number, 
  calculations: GeometryCalculations
): string[] {
  const steps = []
  
  steps.push(`Diketahui: r = ${radius} cm${type !== 'sphere' ? `, t = ${height} cm` : ''}`)
  
  // Surface area steps
  steps.push(`Menghitung luas permukaan:`)
  steps.push(`L = ${calculations.formula?.surfaceArea}`)
  steps.push(`L = ${calculations.substitution?.surfaceArea}`)
  steps.push(`L = ${calculations.surfaceArea.toFixed(2)} cm²`)
  
  // Volume steps
  steps.push(`Menghitung volume:`)
  steps.push(`V = ${calculations.formula?.volume}`)
  steps.push(`V = ${calculations.substitution?.volume}`)
  steps.push(`V = ${calculations.volume.toFixed(2)} cm³`)
  
  return steps
}

/**
 * XP calculation based on performance
 */
export function calculateXP(
  baseXP: number,
  accuracy: number, // 0-1
  timeBonus: boolean = false,
  perfectScore: boolean = false
): number {
  let xp = baseXP * accuracy
  
  if (timeBonus) xp += 25
  if (perfectScore) xp += 50
  
  return Math.floor(xp)
}

/**
 * Level calculation from total XP
 */
export function calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number } {
  const xpPerLevel = 500
  const level = Math.floor(totalXP / xpPerLevel) + 1
  const currentLevelXP = totalXP % xpPerLevel
  const nextLevelXP = xpPerLevel
  
  return { level, currentLevelXP, nextLevelXP }
}