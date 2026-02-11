import type { PortfolioPosition, BrokerProfile, RecommendationImpact, TradeAction } from '../domain/models'
import {
  NDFL_RATE,
  NDFL_HIGH_RATE,
  NDFL_HIGH_INCOME_THRESHOLD,
  TAX_EXEMPT_HOLDING_YEARS,
} from '../domain/constants'

/**
 * Estimates broker commission for a trade.
 */
export function estimateCommission(
  amount: number,
  broker: BrokerProfile,
): number {
  return Math.max(broker.minCommission, amount * broker.commissionRate)
}

/**
 * Estimates capital gains tax (NDFL) for selling a position.
 *
 * Rules applied:
 * - If held for 3+ years on Russian exchanges → tax exempt
 * - Capital gain = sell amount - cost basis
 * - If gain <= 0 → no tax
 * - Rate: 13% (or 15% if annual income > 5M RUB)
 */
export function estimateTax(
  position: PortfolioPosition,
  sellAmount: number,
  annualIncome: number = 0,
): number {
  if (isLongTermExempt(position.purchaseDate)) {
    return 0
  }

  const gain = sellAmount - position.costBasis
  if (gain <= 0) {
    return 0
  }

  const rate = annualIncome > NDFL_HIGH_INCOME_THRESHOLD ? NDFL_HIGH_RATE : NDFL_RATE
  return Math.round(gain * rate * 100) / 100
}

/**
 * Calculates total impact (commission + tax) for a set of trade actions.
 */
export function calculateImpact(
  actions: TradeAction[],
  positions: PortfolioPosition[],
  brokerProfiles: BrokerProfile[],
  improvement: string,
  annualIncome: number = 0,
): RecommendationImpact {
  let totalCommission = 0
  let totalTax = 0

  for (const action of actions) {
    const broker = brokerProfiles.find(b => b.broker === action.broker)
    if (broker) {
      totalCommission += estimateCommission(action.estimatedAmount, broker)
    }

    if (action.direction === 'sell') {
      const position = positions.find(
        p => p.ticker === action.ticker && p.broker === action.broker,
      )
      if (position) {
        totalTax += estimateTax(position, action.estimatedAmount, annualIncome)
      }
    }
  }

  totalCommission = Math.round(totalCommission * 100) / 100
  totalTax = Math.round(totalTax * 100) / 100

  return {
    estimatedCommission: totalCommission,
    estimatedTax: totalTax,
    totalCost: Math.round((totalCommission + totalTax) * 100) / 100,
    portfolioImprovement: improvement,
  }
}

/**
 * Checks if the position qualifies for long-term holding tax exemption (3+ years).
 */
export function isLongTermExempt(purchaseDate: string): boolean {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  const yearsHeld = (now.getTime() - purchase.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return yearsHeld >= TAX_EXEMPT_HOLDING_YEARS
}

/**
 * Determines whether a trade is cost-effective:
 * total cost should be less than costBenefitRatio of the trade amount.
 */
export function isCostEffective(
  tradeAmount: number,
  totalCost: number,
  costBenefitRatio: number = 0.05,
): boolean {
  if (tradeAmount <= 0) return false
  return totalCost / tradeAmount < costBenefitRatio
}
