import type { ViewPosition, PortfolioMetrics, AllocationBreakdown } from '../domain/models'
import { assetClassLabel } from '../domain/formatters'

export function computeMetrics(positions: ViewPosition[]): PortfolioMetrics {
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
  const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasis, 0)
  const totalGain = totalValue - totalCostBasis
  const totalGainPercent = totalCostBasis > 0 ? ((totalGain / totalCostBasis) * 100) : 0
  const brokerCount = new Set(positions.map(p => p.broker)).size

  const allocationByAssetClass = computeAllocation(positions, 'assetClass', totalValue)
  const allocationBySector = computeAllocation(positions, 'sector', totalValue)

  const sorted = [...positions].sort((a, b) => b.currentValue - a.currentValue)
  const topHoldings = sorted.slice(0, 5)

  return {
    totalValue,
    totalCostBasis,
    totalGain,
    totalGainPercent,
    positionCount: positions.length,
    brokerCount,
    allocationByAssetClass,
    allocationBySector,
    topHoldings,
  }
}

function computeAllocation(
  positions: ViewPosition[],
  dimension: 'assetClass' | 'sector',
  totalValue: number,
): AllocationBreakdown[] {
  const groups = new Map<string, number>()

  for (const p of positions) {
    const key = dimension === 'assetClass' ? assetClassLabel(p.assetClass) : p.sector
    groups.set(key, (groups.get(key) ?? 0) + p.currentValue)
  }

  const result: AllocationBreakdown[] = []
  for (const [category, value] of groups) {
    result.push({
      category,
      percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
      value,
    })
  }

  return result.sort((a, b) => b.value - a.value)
}
