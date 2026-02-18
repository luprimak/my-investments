export interface WeightEntry {
  id: string
  date: string // ISO date format YYYY-MM-DD
  weight: number // kg
  note?: string
}

export interface WeightGoal {
  startWeight: number
  targetWeight: number
  startDate: string
}

export interface WeightStats {
  currentWeight: number
  totalLost: number
  remainingToGoal: number
  averageWeight: number
  minWeight: number
  maxWeight: number
  weeklyRate: number // kg per week (negative = losing)
  estimatedGoalDate: string | null
  daysTracked: number
  progressPercent: number
}

export const DEFAULT_GOAL: WeightGoal = {
  startWeight: 95,
  targetWeight: 77,
  startDate: '2025-01-01',
}
