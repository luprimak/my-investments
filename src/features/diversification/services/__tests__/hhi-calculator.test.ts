import { describe, it, expect } from 'vitest'
import { calculateHHI, classifyHHI, calculateHHIFromPercents } from '../hhi-calculator'

describe('calculateHHI', () => {
  it('returns 1 for a single position', () => {
    expect(calculateHHI([100000])).toBe(1)
  })

  it('returns 0.5 for two equal positions', () => {
    expect(calculateHHI([50000, 50000])).toBe(0.5)
  })

  it('returns 0.25 for four equal positions', () => {
    expect(calculateHHI([25000, 25000, 25000, 25000])).toBe(0.25)
  })

  it('returns ~0.1 for ten equal positions', () => {
    const weights = Array(10).fill(10000)
    expect(calculateHHI(weights)).toBeCloseTo(0.1, 2)
  })

  it('returns 0 for empty array', () => {
    expect(calculateHHI([])).toBe(0)
  })

  it('returns 0 for all-zero weights', () => {
    expect(calculateHHI([0, 0, 0])).toBe(0)
  })

  it('handles unequal weights correctly', () => {
    // 80% + 20% → 0.64 + 0.04 = 0.68
    const hhi = calculateHHI([80000, 20000])
    expect(hhi).toBeCloseTo(0.68, 2)
  })
})

describe('classifyHHI', () => {
  it('classifies low concentration', () => {
    expect(classifyHHI(0.05)).toBe('low')
  })

  it('classifies moderate concentration', () => {
    expect(classifyHHI(0.15)).toBe('moderate')
  })

  it('classifies high concentration', () => {
    expect(classifyHHI(0.3)).toBe('high')
  })
})

describe('calculateHHIFromPercents', () => {
  it('converts percentages to proportions and calculates HHI', () => {
    // 50% + 50% → HHI = 0.5
    expect(calculateHHIFromPercents([50, 50])).toBe(0.5)
  })
})
