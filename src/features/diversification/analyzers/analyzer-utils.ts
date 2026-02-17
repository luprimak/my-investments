import type { Portfolio, CategoryWeight, DiversificationWarning, DiversificationDimension, WarningSeverity } from '../domain/models'
import { calculateHHI } from '../services/hhi-calculator'

/**
 * Groups portfolio positions by a given key and computes category weights.
 */
export function computeDistribution(
  portfolio: Portfolio,
  getCategory: (pos: Portfolio['positions'][0]) => string,
): CategoryWeight[] {
  const groups = new Map<string, { value: number; count: number }>()

  for (const pos of portfolio.positions) {
    const category = getCategory(pos)
    const existing = groups.get(category) ?? { value: 0, count: 0 }
    existing.value += pos.currentValue
    existing.count += 1
    groups.set(category, existing)
  }

  return Array.from(groups.entries())
    .map(([category, data]) => ({
      category,
      currentPercent: portfolio.totalValue > 0
        ? Math.round((data.value / portfolio.totalValue) * 10000) / 100
        : 0,
      positionCount: data.count,
      totalValue: Math.round(data.value * 100) / 100,
    }))
    .sort((a, b) => b.currentPercent - a.currentPercent)
}

/**
 * Checks distribution against a maximum threshold and generates warnings.
 */
export function checkThreshold(
  distribution: CategoryWeight[],
  dimension: DiversificationDimension,
  maxPercent: number,
  label: string,
): DiversificationWarning[] {
  const warnings: DiversificationWarning[] = []

  for (const cat of distribution) {
    if (cat.currentPercent > maxPercent) {
      const severity: WarningSeverity = cat.currentPercent > maxPercent * 1.5
        ? 'critical'
        : 'warning'

      warnings.push({
        severity,
        dimension,
        category: cat.category,
        currentPercent: cat.currentPercent,
        threshold: maxPercent,
        message: `${cat.category} составляет ${cat.currentPercent}% ${label} (макс. ${maxPercent}%)`,
      })
    }
  }

  return warnings
}

/**
 * Computes HHI from a distribution.
 */
export function hhiFromDistribution(distribution: CategoryWeight[]): number {
  const values = distribution.map(d => d.totalValue)
  return calculateHHI(values)
}
