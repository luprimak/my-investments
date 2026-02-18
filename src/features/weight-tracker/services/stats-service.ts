import type { WeightEntry, WeightGoal, WeightStats } from '../domain/models'

export function computeStats(entries: WeightEntry[], goal: WeightGoal): WeightStats | null {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const weights = sorted.map(e => e.weight)

  const currentWeight = sorted[sorted.length - 1]!.weight
  const totalLost = goal.startWeight - currentWeight
  const remainingToGoal = currentWeight - goal.targetWeight
  const totalToLose = goal.startWeight - goal.targetWeight
  const progressPercent = totalToLose > 0 ? Math.max(0, Math.min(100, (totalLost / totalToLose) * 100)) : 0

  const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  const firstDate = new Date(sorted[0]!.date)
  const lastDate = new Date(sorted[sorted.length - 1]!.date)
  const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  const weeksDiff = daysDiff / 7
  const daysTracked = Math.round(daysDiff)

  const firstWeight = sorted[0]!.weight
  const weeklyRate = weeksDiff > 0 ? (currentWeight - firstWeight) / weeksDiff : 0

  let estimatedGoalDate: string | null = null
  if (weeklyRate < 0 && remainingToGoal > 0) {
    const weeksToGoal = remainingToGoal / Math.abs(weeklyRate)
    const goalDate = new Date(lastDate)
    goalDate.setDate(goalDate.getDate() + Math.round(weeksToGoal * 7))
    estimatedGoalDate = goalDate.toISOString().split('T')[0]!
  }

  return {
    currentWeight,
    totalLost,
    remainingToGoal,
    averageWeight,
    minWeight,
    maxWeight,
    weeklyRate,
    estimatedGoalDate,
    daysTracked,
    progressPercent,
  }
}

export function getRecentEntries(entries: WeightEntry[], days: number): WeightEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().split('T')[0]!
  return entries.filter(e => e.date >= cutoffStr).sort((a, b) => b.date.localeCompare(a.date))
}
