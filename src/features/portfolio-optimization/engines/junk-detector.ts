import type {
  Portfolio,
  PortfolioPosition,
  JunkPosition,
  JunkPositionReport,
  Recommendation,
  BrokerProfile,
} from '../domain/models'
import type { JunkDetectionConfig } from '../domain/constants'
import { DEFAULT_JUNK_CONFIG } from '../domain/constants'
import { estimateCommission, estimateTax, isCostEffective } from './cost-calculator'

/**
 * Scans a portfolio for "junk" positions — small, deeply losing,
 * illiquid, or duplicate holdings that may not warrant keeping.
 */
export function detectJunkPositions(
  portfolio: Portfolio,
  config: JunkDetectionConfig = DEFAULT_JUNK_CONFIG,
): JunkPositionReport {
  const positions: JunkPosition[] = []

  for (const pos of portfolio.positions) {
    const junk = analyzePosition(pos, portfolio.totalValue, config)
    if (junk) {
      positions.push(junk)
    }
  }

  // Check for duplicates: same ticker across multiple brokers
  const duplicates = findDuplicates(portfolio.positions, portfolio.totalValue)
  for (const dup of duplicates) {
    if (!positions.some(p => p.ticker === dup.ticker && p.broker === dup.broker)) {
      positions.push(dup)
    }
  }

  const totalJunkValue = positions.reduce((sum, p) => sum + p.currentValue, 0)

  return {
    positions,
    totalJunkValue,
    percentOfPortfolio: portfolio.totalValue > 0
      ? Math.round((totalJunkValue / portfolio.totalValue) * 10000) / 100
      : 0,
  }
}

/**
 * Generates recommendations from junk position report.
 * Only recommends closing if the action is cost-effective.
 */
export function generateJunkRecommendations(
  report: JunkPositionReport,
  brokerProfiles: BrokerProfile[],
): Recommendation[] {
  return report.positions
    .filter(pos => {
      const broker = brokerProfiles.find(b => b.broker === pos.broker)
      if (!broker) return true // include without cost check if no broker profile

      const commission = estimateCommission(pos.currentValue, broker)
      return isCostEffective(pos.currentValue, commission)
    })
    .map(pos => ({
      id: `junk-${pos.ticker}-${pos.broker}`,
      type: 'close_position' as const,
      priority: priorityFromReason(pos.reason),
      title: `Закрыть позицию ${pos.ticker}`,
      reason: pos.details,
      impact: {
        estimatedCommission: 0,
        estimatedTax: 0,
        totalCost: 0,
        portfolioImprovement: `Освободить ${formatRub(pos.currentValue)} (${pos.percentOfPortfolio}% портфеля)`,
      },
      actions: [
        {
          broker: pos.broker,
          ticker: pos.ticker,
          direction: 'sell' as const,
          quantity: 0, // Actual quantity computed from position data
          estimatedPrice: 0,
          estimatedAmount: pos.currentValue,
        },
      ],
      status: 'pending' as const,
    }))
}

function analyzePosition(
  pos: PortfolioPosition,
  totalValue: number,
  config: JunkDetectionConfig,
): JunkPosition | null {
  const percent = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0

  // Small position check
  if (
    pos.currentValue < config.minPositionValue &&
    percent < config.minPositionPercent
  ) {
    return {
      ticker: pos.ticker,
      broker: pos.broker,
      reason: 'small_position',
      currentValue: pos.currentValue,
      percentOfPortfolio: Math.round(percent * 100) / 100,
      details: `Позиция слишком мала: ${formatRub(pos.currentValue)} (${percent.toFixed(2)}% портфеля)`,
    }
  }

  // Deep loss check
  const unrealizedReturn = pos.costBasis > 0
    ? ((pos.currentValue - pos.costBasis) / pos.costBasis) * 100
    : 0

  if (unrealizedReturn <= config.deepLossThreshold) {
    return {
      ticker: pos.ticker,
      broker: pos.broker,
      reason: 'deep_loss',
      currentValue: pos.currentValue,
      percentOfPortfolio: Math.round(percent * 100) / 100,
      details: `Глубокий убыток: ${unrealizedReturn.toFixed(1)}% (цена покупки: ${formatRub(pos.costBasis)})`,
    }
  }

  // Illiquid check
  if (pos.dailyVolume < config.illiquidVolumeThreshold && pos.dailyVolume > 0) {
    return {
      ticker: pos.ticker,
      broker: pos.broker,
      reason: 'illiquid',
      currentValue: pos.currentValue,
      percentOfPortfolio: Math.round(percent * 100) / 100,
      details: `Низкая ликвидность: дневной объём ${formatRub(pos.dailyVolume)}`,
    }
  }

  return null
}

function findDuplicates(
  positions: PortfolioPosition[],
  totalValue: number,
): JunkPosition[] {
  const tickerBrokers = new Map<string, PortfolioPosition[]>()

  for (const pos of positions) {
    const existing = tickerBrokers.get(pos.ticker) ?? []
    existing.push(pos)
    tickerBrokers.set(pos.ticker, existing)
  }

  const duplicates: JunkPosition[] = []

  for (const [ticker, brokerPositions] of tickerBrokers) {
    if (brokerPositions.length > 1) {
      // Mark all but the largest position as duplicates
      const sorted = [...brokerPositions].sort((a, b) => b.currentValue - a.currentValue)
      for (let i = 1; i < sorted.length; i++) {
        const pos = sorted[i]!
        const percent = totalValue > 0 ? (pos.currentValue / totalValue) * 100 : 0
        duplicates.push({
          ticker,
          broker: pos.broker,
          reason: 'duplicate',
          currentValue: pos.currentValue,
          percentOfPortfolio: Math.round(percent * 100) / 100,
          details: `Дублируется у ${brokerPositions.length} брокеров. Рекомендуется консолидация.`,
        })
      }
    }
  }

  return duplicates
}

function priorityFromReason(reason: JunkPosition['reason']): Recommendation['priority'] {
  switch (reason) {
    case 'delisted':
      return 'high'
    case 'deep_loss':
      return 'medium'
    case 'small_position':
    case 'illiquid':
    case 'duplicate':
      return 'low'
  }
}

function formatRub(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₽`
}
