import type { DimensionAnalysis, Portfolio } from '../domain/models'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { computeDimensionScore } from '../domain/scoring'
import { computeDistribution, checkThreshold, hhiFromDistribution } from './analyzer-utils'
import type { IDiversificationAnalyzer } from './types'

export class AssetClassAnalyzer implements IDiversificationAnalyzer {
  constructor(private rules: DiversificationRules = DEFAULT_RULES) {}

  analyze(portfolio: Portfolio): DimensionAnalysis {
    const distribution = computeDistribution(portfolio, pos => pos.assetClass || 'Прочее')

    const warnings = checkThreshold(
      distribution,
      'asset_class',
      this.rules.maxSingleAssetClass,
      'портфеля',
    )

    // Warn if bonds component is missing entirely (for portfolios with > 5 positions)
    const hasBonds = distribution.some(d =>
      d.category.includes('Облигации') || d.category.includes('ОФЗ'),
    )
    if (!hasBonds && portfolio.positions.length > 5) {
      warnings.push({
        severity: 'info',
        dimension: 'asset_class',
        category: 'Облигации',
        currentPercent: 0,
        threshold: 0,
        message: 'Облигационная составляющая отсутствует. Рассмотрите добавление облигаций для стабилизации портфеля.',
      })
    }

    const concentrationIndex = hhiFromDistribution(distribution)
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length

    return {
      dimension: 'asset_class',
      score: computeDimensionScore(concentrationIndex, criticalCount, warningCount),
      distribution,
      warnings,
      concentrationIndex,
    }
  }
}
