import type { DimensionAnalysis, Portfolio } from '../domain/models'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { computeDimensionScore } from '../domain/scoring'
import { computeDistribution, checkThreshold, hhiFromDistribution } from './analyzer-utils'
import type { IDiversificationAnalyzer } from './types'

export class SectorAnalyzer implements IDiversificationAnalyzer {
  constructor(private rules: DiversificationRules = DEFAULT_RULES) {}

  analyze(portfolio: Portfolio): DimensionAnalysis {
    const distribution = computeDistribution(portfolio, pos => pos.sector || 'Прочее')

    const warnings = checkThreshold(
      distribution,
      'sector',
      this.rules.maxSingleSector,
      'портфеля',
    )

    // Warn if only 1-2 sectors represented
    const significantSectors = distribution.filter(d => d.currentPercent >= 5)
    if (significantSectors.length <= 2 && portfolio.positions.length > 3) {
      warnings.push({
        severity: 'warning',
        dimension: 'sector',
        category: 'Секторы',
        currentPercent: 0,
        threshold: 3,
        message: `Только ${significantSectors.length} значимых сектора. Рекомендуется минимум 3-4 сектора.`,
      })
    }

    const concentrationIndex = hhiFromDistribution(distribution)
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length

    return {
      dimension: 'sector',
      score: computeDimensionScore(concentrationIndex, criticalCount, warningCount),
      distribution,
      warnings,
      concentrationIndex,
    }
  }
}
