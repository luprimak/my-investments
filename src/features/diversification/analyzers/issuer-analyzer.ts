import type { DimensionAnalysis, Portfolio } from '../domain/models'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { computeDimensionScore } from '../domain/scoring'
import { computeDistribution, checkThreshold, hhiFromDistribution } from './analyzer-utils'
import type { IDiversificationAnalyzer } from './types'

export class IssuerAnalyzer implements IDiversificationAnalyzer {
  constructor(private rules: DiversificationRules = DEFAULT_RULES) {}

  analyze(portfolio: Portfolio): DimensionAnalysis {
    const distribution = computeDistribution(portfolio, pos => pos.ticker)

    const warnings = checkThreshold(
      distribution,
      'issuer',
      this.rules.maxSingleIssuer,
      'портфеля',
    )

    // Check top-5 concentration
    const top5 = distribution.slice(0, 5)
    const top5Percent = top5.reduce((sum, d) => sum + d.currentPercent, 0)

    if (top5Percent > this.rules.maxTop5Concentration) {
      warnings.push({
        severity: top5Percent > this.rules.maxTop5Concentration * 1.3 ? 'critical' : 'warning',
        dimension: 'issuer',
        category: 'Топ-5 эмитентов',
        currentPercent: Math.round(top5Percent * 100) / 100,
        threshold: this.rules.maxTop5Concentration,
        message: `Топ-5 эмитентов составляют ${top5Percent.toFixed(1)}% портфеля (макс. ${this.rules.maxTop5Concentration}%)`,
      })
    }

    // Check position count
    if (portfolio.positions.length < this.rules.optimalPositionCount.min) {
      warnings.push({
        severity: 'info',
        dimension: 'issuer',
        category: 'Количество позиций',
        currentPercent: 0,
        threshold: this.rules.optimalPositionCount.min,
        message: `В портфеле ${portfolio.positions.length} позиций (рекомендуется ${this.rules.optimalPositionCount.min}-${this.rules.optimalPositionCount.max})`,
      })
    }

    const concentrationIndex = hhiFromDistribution(distribution)
    const criticalCount = warnings.filter(w => w.severity === 'critical').length
    const warningCount = warnings.filter(w => w.severity === 'warning').length

    return {
      dimension: 'issuer',
      score: computeDimensionScore(concentrationIndex, criticalCount, warningCount),
      distribution,
      warnings,
      concentrationIndex,
    }
  }
}
