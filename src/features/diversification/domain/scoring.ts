import type { DimensionAnalysis, OverallRating } from './models'

/**
 * Computes a composite diversification score (0-100) from dimension analyses.
 *
 * Weights:
 * - asset_class: 30%
 * - sector: 25%
 * - issuer: 25%
 * - geography: 10%
 * - currency: 10%
 */
export function computeCompositeScore(dimensions: DimensionAnalysis[]): number {
  const weights: Record<string, number> = {
    asset_class: 0.30,
    sector: 0.25,
    issuer: 0.25,
    geography: 0.10,
    currency: 0.10,
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const dim of dimensions) {
    const w = weights[dim.dimension] ?? 0.1
    weightedSum += dim.score * w
    totalWeight += w
  }

  if (totalWeight === 0) return 0
  return Math.round(weightedSum / totalWeight)
}

/**
 * Converts numeric score to a qualitative rating.
 */
export function scoreToRating(score: number): OverallRating {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

/**
 * Computes a dimension score from HHI and warning count.
 *
 * - HHI 0 → 100 (perfect diversification)
 * - HHI 1 → 0 (single position)
 * - Warnings reduce score further
 */
export function computeDimensionScore(
  concentrationIndex: number,
  criticalWarnings: number,
  regularWarnings: number,
): number {
  // Base score from HHI: lower HHI = higher score
  const baseScore = Math.round((1 - Math.min(concentrationIndex, 1)) * 100)

  // Penalty for warnings
  const warningPenalty = criticalWarnings * 15 + regularWarnings * 5

  return Math.max(0, Math.min(100, baseScore - warningPenalty))
}
