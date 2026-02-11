import type { DimensionAnalysis, Portfolio } from '../domain/models'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { computeDimensionScore } from '../domain/scoring'
import { computeDistribution, checkThreshold, hhiFromDistribution } from './analyzer-utils'
import type { IDiversificationAnalyzer } from './types'

export class CurrencyAnalyzer implements IDiversificationAnalyzer {
  constructor(private rules: DiversificationRules = DEFAULT_RULES) {}

  analyze(portfolio: Portfolio): DimensionAnalysis {
    const distribution = computeDistribution(portfolio, pos => pos.currency || 'RUB')

    const warnings = checkThreshold(
      distribution,
      'currency',
      this.rules.maxSingleCurrency,
      'портфеля',
    )

    const concentrationIndex = hhiFromDistribution(distribution)
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length

    return {
      dimension: 'currency',
      score: computeDimensionScore(concentrationIndex, criticalCount, warningCount),
      distribution,
      warnings,
      concentrationIndex,
    }
  }
}
