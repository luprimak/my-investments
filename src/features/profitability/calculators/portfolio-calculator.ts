import type { PositionReturn, PortfolioReturn, ReturnPeriod } from '../domain/models'

export function aggregatePortfolio(
  positions: PositionReturn[],
  period: ReturnPeriod,
): PortfolioReturn {
  const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasis, 0)
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
  const totalAbsoluteReturn = positions.reduce((sum, p) => sum + p.absoluteReturn, 0)
  const totalDividends = positions.reduce((sum, p) => sum + p.dividendsReceived, 0)
  const totalCommissions = positions.reduce((sum, p) => sum + p.commissionsPaid, 0)
  const totalRelativeReturn = totalCostBasis > 0
    ? (totalAbsoluteReturn / totalCostBasis) * 100
    : 0

  return {
    totalCostBasis,
    totalCurrentValue,
    totalAbsoluteReturn,
    totalRelativeReturn,
    totalDividends,
    totalCommissions,
    positions,
    period,
  }
}

export function extractPerformers(
  positions: PositionReturn[],
  count: number,
): { best: PositionReturn[]; worst: PositionReturn[] } {
  const sorted = [...positions].sort((a, b) => b.relativeReturn - a.relativeReturn)
  return {
    best: sorted.slice(0, count),
    worst: sorted.slice(-count).reverse(),
  }
}
