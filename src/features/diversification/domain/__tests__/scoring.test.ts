import { describe, it, expect } from 'vitest'
import { computeCompositeScore, scoreToRating, computeDimensionScore } from '../scoring'
import type { DimensionAnalysis } from '../models'

describe('computeCompositeScore', () => {
  it('computes weighted average of dimension scores', () => {
    const dimensions: DimensionAnalysis[] = [
      { dimension: 'asset_class', score: 80, distribution: [], warnings: [], concentrationIndex: 0.1 },
      { dimension: 'sector', score: 60, distribution: [], warnings: [], concentrationIndex: 0.2 },
      { dimension: 'issuer', score: 70, distribution: [], warnings: [], concentrationIndex: 0.15 },
      { dimension: 'geography', score: 50, distribution: [], warnings: [], concentrationIndex: 0.3 },
      { dimension: 'currency', score: 40, distribution: [], warnings: [], concentrationIndex: 0.5 },
    ]

    const score = computeCompositeScore(dimensions)
    // 80*0.3 + 60*0.25 + 70*0.25 + 50*0.1 + 40*0.1 = 24 + 15 + 17.5 + 5 + 4 = 65.5
    expect(score).toBe(66) // rounded
  })

  it('returns 0 for empty dimensions', () => {
    expect(computeCompositeScore([])).toBe(0)
  })
})

describe('scoreToRating', () => {
  it('returns excellent for 80+', () => {
    expect(scoreToRating(85)).toBe('excellent')
  })

  it('returns good for 60-79', () => {
    expect(scoreToRating(65)).toBe('good')
  })

  it('returns fair for 40-59', () => {
    expect(scoreToRating(45)).toBe('fair')
  })

  it('returns poor for below 40', () => {
    expect(scoreToRating(20)).toBe('poor')
  })
})

describe('computeDimensionScore', () => {
  it('gives 100 for HHI=0 and no warnings', () => {
    expect(computeDimensionScore(0, 0, 0)).toBe(100)
  })

  it('gives 0 for HHI=1', () => {
    expect(computeDimensionScore(1, 0, 0)).toBe(0)
  })

  it('reduces score for warnings', () => {
    const base = computeDimensionScore(0.1, 0, 0)
    const withWarning = computeDimensionScore(0.1, 0, 1)
    expect(withWarning).toBe(base - 5)
  })

  it('reduces score more for critical warnings', () => {
    const base = computeDimensionScore(0.1, 0, 0)
    const withCritical = computeDimensionScore(0.1, 1, 0)
    expect(withCritical).toBe(base - 15)
  })

  it('never goes below 0', () => {
    expect(computeDimensionScore(0.9, 3, 5)).toBe(0)
  })
})
