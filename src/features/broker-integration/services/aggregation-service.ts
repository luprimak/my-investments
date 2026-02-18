import type {
  Portfolio,
  ConsolidatedPosition,
  AggregatedPortfolio,
  BrokerHolding,
} from '../domain/models'

export function aggregatePortfolios(portfolios: Portfolio[]): AggregatedPortfolio {
  const positionMap = new Map<string, { name: string; instrumentType: ConsolidatedPosition['instrumentType']; holdings: BrokerHolding[] }>()

  for (const portfolio of portfolios) {
    for (const pos of portfolio.positions) {
      let entry = positionMap.get(pos.ticker)
      if (!entry) {
        entry = {
          name: pos.name,
          instrumentType: pos.instrumentType,
          holdings: [],
        }
        positionMap.set(pos.ticker, entry)
      }

      entry.holdings.push({
        broker: portfolio.broker,
        brokerId: portfolio.brokerId,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentValue: pos.currentValue,
      })
    }
  }

  const consolidatedPositions: ConsolidatedPosition[] = []
  for (const [ticker, entry] of positionMap) {
    const totalQuantity = entry.holdings.reduce((sum, h) => sum + h.quantity, 0)
    const totalCostBasis = entry.holdings.reduce((sum, h) => sum + h.quantity * h.averagePrice, 0)
    const totalValue = entry.holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const weightedAveragePrice = totalQuantity > 0 ? totalCostBasis / totalQuantity : 0

    consolidatedPositions.push({
      ticker,
      name: entry.name,
      instrumentType: entry.instrumentType,
      holdings: entry.holdings,
      totalQuantity,
      weightedAveragePrice,
      totalValue,
      totalPnL: totalValue - totalCostBasis,
    })
  }

  consolidatedPositions.sort((a, b) => b.totalValue - a.totalValue)

  const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0)
  const totalCostBasis = consolidatedPositions.reduce(
    (sum, p) => sum + p.totalQuantity * p.weightedAveragePrice, 0,
  )

  const syncTimes = portfolios.map(p => p.syncedAt).filter(Boolean)
  const oldestSync = syncTimes.length > 0
    ? syncTimes.reduce((oldest, t) => (t < oldest ? t : oldest))
    : new Date().toISOString()

  return {
    brokers: portfolios,
    consolidatedPositions,
    totalValue,
    totalPnL: totalValue - totalCostBasis,
    syncedAt: oldestSync,
  }
}
