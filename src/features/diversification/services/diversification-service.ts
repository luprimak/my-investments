import type { DiversificationReport, Portfolio } from '../domain/models'
import { computeCompositeScore, scoreToRating } from '../domain/scoring'
import type { DiversificationRules } from '../domain/rules'
import { DEFAULT_RULES } from '../domain/rules'
import { calculateHHI } from './hhi-calculator'
import { generateRecommendations } from './recommendation-generator'
import { IssuerAnalyzer } from '../analyzers/issuer-analyzer'
import { SectorAnalyzer } from '../analyzers/sector-analyzer'
import { AssetClassAnalyzer } from '../analyzers/asset-class-analyzer'
import { GeographyAnalyzer } from '../analyzers/geography-analyzer'
import { CurrencyAnalyzer } from '../analyzers/currency-analyzer'
import type { IDiversificationAnalyzer } from '../analyzers/types'

/**
 * Orchestrates all dimension analyzers and produces a unified diversification report.
 */
export function generateReport(
  portfolio: Portfolio,
  rules: DiversificationRules = DEFAULT_RULES,
): DiversificationReport {
  const analyzers: IDiversificationAnalyzer[] = [
    new AssetClassAnalyzer(rules),
    new SectorAnalyzer(rules),
    new IssuerAnalyzer(rules),
    new GeographyAnalyzer(rules),
    new CurrencyAnalyzer(rules),
  ]

  const dimensions = analyzers.map(a => a.analyze(portfolio))
  const overallScore = computeCompositeScore(dimensions)
  const recommendations = generateRecommendations(dimensions)

  // Portfolio-level HHI (by position value)
  const positionValues = portfolio.positions.map(p => p.currentValue)
  const herfindahlIndex = calculateHHI(positionValues)

  return {
    userId: portfolio.userId,
    generatedAt: new Date().toISOString(),
    overallScore,
    overallRating: scoreToRating(overallScore),
    dimensions,
    recommendations,
    herfindahlIndex,
  }
}

/**
 * Generates a diversification report across multiple broker portfolios.
 */
export function generateAggregatedReport(
  portfolios: Portfolio[],
  rules: DiversificationRules = DEFAULT_RULES,
): DiversificationReport {
  // Merge all positions into a single portfolio
  const allPositions = portfolios.flatMap(p => p.positions)
  const totalValue = allPositions.reduce((sum, p) => sum + p.currentValue, 0)
  const userId = portfolios[0]?.userId ?? 'unknown'

  const merged: Portfolio = {
    userId,
    positions: allPositions,
    totalValue,
  }

  return generateReport(merged, rules)
}
