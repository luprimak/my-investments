import { describe, it, expect } from 'vitest'
import { computeStats, getRecentEntries } from '../stats-service'
import type { WeightEntry, WeightGoal } from '../../domain/models'

const GOAL: WeightGoal = {
  startWeight: 95,
  targetWeight: 77,
  startDate: '2025-01-01',
}

const ENTRIES: WeightEntry[] = [
  { id: '1', date: '2025-01-01', weight: 95.0 },
  { id: '2', date: '2025-01-08', weight: 94.2 },
  { id: '3', date: '2025-01-15', weight: 93.5 },
  { id: '4', date: '2025-01-22', weight: 92.8 },
  { id: '5', date: '2025-01-29', weight: 92.0 },
]

describe('computeStats', () => {
  it('returns null for empty entries', () => {
    expect(computeStats([], GOAL)).toBeNull()
  })

  it('computes current weight from latest entry', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.currentWeight).toBe(92.0)
  })

  it('computes total weight lost', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.totalLost).toBeCloseTo(3.0, 1)
  })

  it('computes remaining to goal', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.remainingToGoal).toBeCloseTo(15.0, 1)
  })

  it('computes progress percentage', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    // Lost 3 of 18 total = 16.67%
    expect(stats.progressPercent).toBeCloseTo(16.67, 0)
  })

  it('computes min and max weights', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.minWeight).toBe(92.0)
    expect(stats.maxWeight).toBe(95.0)
  })

  it('computes average weight', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    const expected = (95.0 + 94.2 + 93.5 + 92.8 + 92.0) / 5
    expect(stats.averageWeight).toBeCloseTo(expected, 1)
  })

  it('computes negative weekly rate (losing weight)', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.weeklyRate).toBeLessThan(0)
  })

  it('estimates goal date when losing weight', () => {
    const stats = computeStats(ENTRIES, GOAL)!
    expect(stats.estimatedGoalDate).toBeTruthy()
    expect(stats.estimatedGoalDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles single entry', () => {
    const stats = computeStats([ENTRIES[0]!], GOAL)!
    expect(stats.currentWeight).toBe(95.0)
    expect(stats.totalLost).toBe(0)
    expect(stats.daysTracked).toBe(0)
  })
})

describe('getRecentEntries', () => {
  it('returns entries within the specified days', () => {
    const today = new Date().toISOString().split('T')[0]!
    const recent: WeightEntry[] = [
      { id: 'r1', date: today, weight: 90.0 },
    ]
    const result = getRecentEntries(recent, 7)
    expect(result.length).toBe(1)
  })

  it('filters out old entries', () => {
    const old: WeightEntry[] = [
      { id: 'old', date: '2020-01-01', weight: 100 },
    ]
    const result = getRecentEntries(old, 30)
    expect(result.length).toBe(0)
  })

  it('returns entries sorted newest first', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const entries: WeightEntry[] = [
      { id: 'a', date: yesterday.toISOString().split('T')[0]!, weight: 91 },
      { id: 'b', date: today.toISOString().split('T')[0]!, weight: 90 },
    ]
    const result = getRecentEntries(entries, 7)
    expect(result[0]!.weight).toBe(90)
  })
})
