import type {
  Portfolio,
  PortfolioPosition,
  Recommendation,
  TradeAction,
  RebalancePlan,
  AllocationSnapshot,
  BrokerProfile,
} from '../domain/models'
import type { Deviation } from '../../target-allocation/domain/models'
import { calculateImpact, isLongTermExempt, isCostEffective } from './cost-calculator'
import { MIN_COST_BENEFIT_RATIO } from '../domain/constants'

interface RebalanceInput {
  portfolio: Portfolio
  deviations: Deviation[]
  brokerProfiles: BrokerProfile[]
}

/**
 * Computes a rebalancing plan using a minimum-trades approach:
 *
 * 1. Identify over-target (sell) and under-target (buy) categories
 * 2. Prefer selling positions with losses (tax-loss harvesting) or long-term holdings (tax exempt)
 * 3. Match sells to buys, minimizing trade count
 * 4. Filter out trades where cost exceeds benefit threshold
 */
export function computeRebalancePlan(input: RebalanceInput): RebalancePlan {
  const { portfolio, deviations, brokerProfiles } = input

  if (portfolio.totalValue === 0 || deviations.length === 0) {
    return emptyPlan(deviations)
  }

  const overTargets = deviations.filter(d => d.deviationPercent > 0)
  const underTargets = deviations.filter(d => d.deviationPercent < 0)

  const recommendations: Recommendation[] = []

  // Compute sell trades for over-target categories
  const sellTrades: TradeAction[] = []
  for (const deviation of overTargets) {
    if (deviation.severity === 'ok') continue

    const excessAmount = (deviation.deviationPercent / 100) * portfolio.totalValue
    const positions = findPositionsInCategory(portfolio, deviation.category)
    const trades = planSellTrades(positions, excessAmount)
    sellTrades.push(...trades)
  }

  // Compute buy trades for under-target categories
  const buyTrades: TradeAction[] = []
  const totalSellAmount = sellTrades.reduce((sum, t) => sum + t.estimatedAmount, 0)
  let remainingBuyBudget = totalSellAmount

  for (const deviation of underTargets) {
    if (deviation.severity === 'ok') continue

    const deficitAmount = Math.abs(deviation.deviationPercent / 100) * portfolio.totalValue
    const buyAmount = Math.min(deficitAmount, remainingBuyBudget)

    if (buyAmount <= 0) continue

    const preferredBroker = selectPreferredBroker(brokerProfiles)
    buyTrades.push({
      broker: preferredBroker,
      ticker: deviation.category, // Placeholder — actual ticker resolution requires market data
      direction: 'buy',
      quantity: 0, // Resolved when actual prices available
      estimatedPrice: 0,
      estimatedAmount: Math.round(buyAmount * 100) / 100,
    })

    remainingBuyBudget -= buyAmount
  }

  // Combine and filter cost-effective trades
  const allActions = [...sellTrades, ...buyTrades]

  if (allActions.length > 0) {
    const impact = calculateImpact(
      allActions,
      portfolio.positions,
      brokerProfiles,
      computeImprovementDescription(deviations, portfolio.totalValue),
    )

    // Only recommend if total cost is reasonable relative to total trade volume
    const totalTradeVolume = allActions.reduce((sum, a) => sum + a.estimatedAmount, 0)
    if (isCostEffective(totalTradeVolume, impact.totalCost, MIN_COST_BENEFIT_RATIO)) {
      recommendations.push({
        id: `rebalance-${Date.now()}`,
        type: 'rebalance_trade',
        priority: deviations.some(d => d.severity === 'critical') ? 'high' : 'medium',
        title: 'Ребалансировка портфеля',
        reason: computeRebalanceReason(deviations),
        impact,
        actions: allActions,
        status: 'pending',
      })
    }
  }

  const beforeSnapshot = buildSnapshot(deviations, 'current')
  const afterSnapshot = buildSnapshot(deviations, 'target')

  return {
    recommendations,
    totalCost: recommendations.reduce((sum, r) => sum + r.impact.totalCost, 0),
    beforeSnapshot,
    afterSnapshot,
  }
}

/**
 * Plans sell trades for positions in an over-allocated category.
 * Prioritizes selling positions with losses (tax-loss harvesting)
 * or those held 3+ years (tax exempt).
 */
function planSellTrades(
  positions: PortfolioPosition[],
  targetSellAmount: number,
): TradeAction[] {
  const trades: TradeAction[] = []
  let remaining = targetSellAmount

  // Sort: prefer selling losers first, then long-term holdings, then others
  const sorted = [...positions].sort((a, b) => {
    const aReturn = a.costBasis > 0 ? (a.currentValue - a.costBasis) / a.costBasis : 0
    const bReturn = b.costBasis > 0 ? (b.currentValue - b.costBasis) / b.costBasis : 0

    // Sell losers first (tax-loss harvesting)
    if (aReturn < 0 && bReturn >= 0) return -1
    if (bReturn < 0 && aReturn >= 0) return 1

    // Then prefer long-term holdings (tax exempt)
    const aExempt = isLongTermExempt(a.purchaseDate)
    const bExempt = isLongTermExempt(b.purchaseDate)
    if (aExempt && !bExempt) return -1
    if (bExempt && !aExempt) return 1

    // Then by unrealized return (sell smallest gains first)
    return aReturn - bReturn
  })

  for (const pos of sorted) {
    if (remaining <= 0) break

    const sellAmount = Math.min(pos.currentValue, remaining)
    const sellQuantity = pos.currentPrice > 0
      ? Math.floor(sellAmount / pos.currentPrice)
      : 0

    if (sellQuantity <= 0 && sellAmount < pos.currentValue) continue

    const actualSellAmount = sellQuantity > 0
      ? sellQuantity * pos.currentPrice
      : sellAmount

    trades.push({
      broker: pos.broker,
      ticker: pos.ticker,
      direction: 'sell',
      quantity: sellQuantity,
      estimatedPrice: pos.currentPrice,
      estimatedAmount: Math.round(actualSellAmount * 100) / 100,
    })

    remaining -= actualSellAmount
  }

  return trades
}

function findPositionsInCategory(
  portfolio: Portfolio,
  category: string,
): PortfolioPosition[] {
  return portfolio.positions.filter(
    p => p.assetClass === category || p.sector === category,
  )
}

function selectPreferredBroker(profiles: BrokerProfile[]): string {
  if (profiles.length === 0) return 'default'

  // Select the broker with the lowest commission rate
  const sorted = [...profiles].sort((a, b) => a.commissionRate - b.commissionRate)
  return sorted[0]!.broker
}

function computeImprovementDescription(deviations: Deviation[], totalValue: number): string {
  const maxDeviation = Math.max(...deviations.map(d => Math.abs(d.deviationPercent)))
  const totalTradeAmount = deviations
    .filter(d => d.severity !== 'ok')
    .reduce((sum, d) => sum + Math.abs(d.deviationPercent / 100) * totalValue, 0)

  return `Максимальное отклонение уменьшится с ${maxDeviation.toFixed(1)}% до ~2%. Объём операций: ${Math.round(totalTradeAmount).toLocaleString('ru-RU')} ₽`
}

function computeRebalanceReason(deviations: Deviation[]): string {
  const critical = deviations.filter(d => d.severity === 'critical')
  const warning = deviations.filter(d => d.severity === 'warning')

  const parts: string[] = []
  if (critical.length > 0) {
    parts.push(`${critical.length} критических отклонений`)
  }
  if (warning.length > 0) {
    parts.push(`${warning.length} предупреждений`)
  }
  return `Обнаружено: ${parts.join(', ')}`
}

function buildSnapshot(deviations: Deviation[], type: 'current' | 'target'): AllocationSnapshot {
  return {
    categories: deviations.map(d => ({
      category: d.category,
      percent: type === 'current' ? d.currentPercent : d.targetPercent,
    })),
  }
}

function emptyPlan(deviations: Deviation[]): RebalancePlan {
  return {
    recommendations: [],
    totalCost: 0,
    beforeSnapshot: buildSnapshot(deviations, 'current'),
    afterSnapshot: buildSnapshot(deviations, 'target'),
  }
}
