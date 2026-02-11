/**
 * Calculates the Herfindahl-Hirschman Index (HHI) for a set of weights.
 *
 * HHI = sum of (weight_i)^2 where weights are proportions (0-1)
 *
 * - HHI close to 0: perfectly diversified
 * - HHI = 1: single position (100% concentration)
 *
 * Standard thresholds:
 * - HHI < 0.10: well diversified
 * - HHI 0.10-0.25: moderate concentration
 * - HHI > 0.25: high concentration
 */
export function calculateHHI(weights: number[]): number {
  if (weights.length === 0) return 0

  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total === 0) return 0

  const hhi = weights.reduce((sum, w) => {
    const proportion = w / total
    return sum + proportion * proportion
  }, 0)

  return Math.round(hhi * 10000) / 10000
}

/**
 * Classifies HHI concentration level.
 */
export function classifyHHI(hhi: number): 'low' | 'moderate' | 'high' {
  if (hhi < 0.10) return 'low'
  if (hhi < 0.25) return 'moderate'
  return 'high'
}

/**
 * Calculates HHI from percentage values (0-100).
 */
export function calculateHHIFromPercents(percents: number[]): number {
  const proportions = percents.map(p => p / 100)
  return calculateHHI(proportions)
}
