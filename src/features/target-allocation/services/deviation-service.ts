import type {
  AllocationRule,
  Deviation,
  DeviationSeverity,
  DeviationThresholds,
  Portfolio,
} from '../domain/models'
import { DEFAULT_THRESHOLDS } from '../domain/models'

/**
 * Computes deviations between current portfolio and target allocation rules.
 * Groups portfolio positions by the appropriate dimension and compares against targets.
 */
export function computeDeviations(
  rules: AllocationRule[],
  portfolio: Portfolio,
  thresholds: DeviationThresholds = DEFAULT_THRESHOLDS,
): Deviation[] {
  const currentDistribution = computeCurrentDistribution(rules, portfolio)

  return rules.map(rule => {
    const currentPercent = currentDistribution.get(ruleKey(rule)) ?? 0
    const deviationPercent = Math.round((currentPercent - rule.targetPercent) * 100) / 100

    return {
      category: rule.category,
      dimension: rule.dimension,
      targetPercent: rule.targetPercent,
      currentPercent: Math.round(currentPercent * 100) / 100,
      deviationPercent,
      severity: classifySeverity(Math.abs(deviationPercent), thresholds),
    }
  })
}

/**
 * Determines whether rebalancing is needed based on deviations.
 */
export function needsRebalancing(deviations: Deviation[]): boolean {
  return deviations.some(d => d.severity === 'critical')
}

/**
 * Determines whether rebalancing is recommended (warning level).
 */
export function rebalancingRecommended(deviations: Deviation[]): boolean {
  return deviations.some(d => d.severity === 'warning' || d.severity === 'critical')
}

function classifySeverity(
  absoluteDeviation: number,
  thresholds: DeviationThresholds,
): DeviationSeverity {
  if (absoluteDeviation >= thresholds.criticalPercent) return 'critical'
  if (absoluteDeviation >= thresholds.warningPercent) return 'warning'
  return 'ok'
}

/**
 * Computes the current percentage distribution of the portfolio,
 * grouped by the dimensions present in the rules.
 */
function computeCurrentDistribution(
  rules: AllocationRule[],
  portfolio: Portfolio,
): Map<string, number> {
  const distribution = new Map<string, number>()

  if (portfolio.totalValue === 0) {
    return distribution
  }

  for (const rule of rules) {
    const matchingValue = portfolio.positions
      .filter(p => getPositionCategory(p, rule.dimension) === rule.category)
      .reduce((sum, p) => sum + p.currentValue, 0)

    const percent = (matchingValue / portfolio.totalValue) * 100
    distribution.set(ruleKey(rule), percent)
  }

  return distribution
}

function ruleKey(rule: AllocationRule): string {
  return `${rule.dimension}:${rule.category}`
}

function getPositionCategory(
  position: { assetClass: string; sector: string; ticker: string },
  dimension: AllocationRule['dimension'],
): string {
  switch (dimension) {
    case 'asset_class':
      return position.assetClass
    case 'sector':
      return position.sector
    case 'issuer':
      return position.ticker
  }
}
