import type { DimensionAnalysis, Portfolio } from '../domain/models'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { computeDimensionScore } from '../domain/scoring'
import { computeDistribution, checkThreshold, hhiFromDistribution } from './analyzer-utils'
import type { IDiversificationAnalyzer } from './types'

export class GeographyAnalyzer implements IDiversificationAnalyzer {
  constructor(private rules: DiversificationRules = DEFAULT_RULES) {}

  analyze(portfolio: Portfolio): DimensionAnalysis {
    const distribution = computeDistribution(portfolio, pos => pos.geography || 'Россия')

    const warnings = checkThreshold(
      distribution,
      'geography',
      this.rules.maxSingleGeography,
      'портфеля',
    )

    // For Russian-focused portfolio, geography diversification is naturally limited
    // Only warn if 100% single geography with many positions
    if (distribution.length === 1 && portfolio.positions.length > 10) {
      warnings.push({
        severity: 'info',
        dimension: 'geography',
        category: distribution[0]!.category,
        currentPercent: 100,
        threshold: 100,
        message: 'Все позиции в одной юрисдикции. Для дополнительной диверсификации рассмотрите международные ETF на MOEX.',
      })
    }

    const concentrationIndex = hhiFromDistribution(distribution)
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length

    return {
      dimension: 'geography',
      score: computeDimensionScore(concentrationIndex, criticalCount, warningCount),
      distribution,
      warnings,
      concentrationIndex,
    }
  }
}
