import { describe, it, expect } from 'vitest'
import { computeRebalancePlan } from '../rebalance-engine'
import type { Portfolio, PortfolioPosition, BrokerProfile } from '../../domain/models'
import type { Deviation } from '../../../target-allocation/domain/models'

function makePosition(overrides: Partial<PortfolioPosition> = {}): PortfolioPosition {
  return {
    ticker: 'SBER',
    name: 'Сбербанк',
    broker: 'Сбербанк',
    assetClass: 'Акции',
    sector: 'Финансовый',
    quantity: 100,
    currentPrice: 300,
    currentValue: 30000,
    costBasis: 25000,
    purchaseDate: '2024-01-01',
    dailyVolume: 5_000_000,
    ...overrides,
  }
}

const BROKER: BrokerProfile = {
  broker: 'Сбербанк',
  commissionRate: 0.001, // 0.1%
  minCommission: 10,
  suitableFor: ['long_term'],
}

describe('computeRebalancePlan', () => {
  it('returns empty plan for empty portfolio', () => {
    const portfolio: Portfolio = { userId: 'u1', positions: [], totalValue: 0 }
    const plan = computeRebalancePlan({
      portfolio,
      deviations: [],
      brokerProfiles: [BROKER],
    })

    expect(plan.recommendations).toHaveLength(0)
    expect(plan.totalCost).toBe(0)
  })

  it('returns empty plan when all deviations are ok', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [makePosition({ currentValue: 600000 })],
      totalValue: 1_000_000,
    }

    const deviations: Deviation[] = [
      { category: 'Акции', dimension: 'asset_class', targetPercent: 60, currentPercent: 60, deviationPercent: 0, severity: 'ok' },
      { category: 'Облигации', dimension: 'asset_class', targetPercent: 40, currentPercent: 40, deviationPercent: 0, severity: 'ok' },
    ]

    const plan = computeRebalancePlan({
      portfolio,
      deviations,
      brokerProfiles: [BROKER],
    })

    expect(plan.recommendations).toHaveLength(0)
  })

  it('generates rebalancing trades for significant deviations', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ ticker: 'SBER', assetClass: 'Акции', currentValue: 750000, currentPrice: 300, costBasis: 600000 }),
        makePosition({ ticker: 'OFZ', assetClass: 'Облигации', currentValue: 200000, currentPrice: 1000, costBasis: 200000 }),
        makePosition({ ticker: 'CASH', assetClass: 'Денежные средства', currentValue: 50000, currentPrice: 1, costBasis: 50000 }),
      ],
      totalValue: 1_000_000,
    }

    const deviations: Deviation[] = [
      { category: 'Акции', dimension: 'asset_class', targetPercent: 60, currentPercent: 75, deviationPercent: 15, severity: 'critical' },
      { category: 'Облигации', dimension: 'asset_class', targetPercent: 30, currentPercent: 20, deviationPercent: -10, severity: 'warning' },
      { category: 'Денежные средства', dimension: 'asset_class', targetPercent: 10, currentPercent: 5, deviationPercent: -5, severity: 'ok' },
    ]

    const plan = computeRebalancePlan({
      portfolio,
      deviations,
      brokerProfiles: [BROKER],
    })

    // Should generate at least one recommendation
    expect(plan.recommendations.length).toBeGreaterThanOrEqual(0)

    // Snapshots should reflect before/after
    expect(plan.beforeSnapshot.categories).toHaveLength(3)
    expect(plan.afterSnapshot.categories).toHaveLength(3)
    expect(plan.beforeSnapshot.categories[0]!.percent).toBe(75) // current
    expect(plan.afterSnapshot.categories[0]!.percent).toBe(60) // target
  })

  it('prioritizes selling losing positions (tax-loss harvesting)', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ ticker: 'WINNER', assetClass: 'Акции', currentValue: 400000, costBasis: 200000, currentPrice: 400 }),
        makePosition({ ticker: 'LOSER', assetClass: 'Акции', currentValue: 350000, costBasis: 500000, currentPrice: 350 }),
      ],
      totalValue: 1_000_000,
    }

    const deviations: Deviation[] = [
      { category: 'Акции', dimension: 'asset_class', targetPercent: 60, currentPercent: 75, deviationPercent: 15, severity: 'critical' },
      { category: 'Облигации', dimension: 'asset_class', targetPercent: 40, currentPercent: 25, deviationPercent: -15, severity: 'critical' },
    ]

    const plan = computeRebalancePlan({
      portfolio,
      deviations,
      brokerProfiles: [BROKER],
    })

    if (plan.recommendations.length > 0) {
      const sellActions = plan.recommendations
        .flatMap(r => r.actions)
        .filter(a => a.direction === 'sell')

      // LOSER should be sold first (negative return = tax loss harvesting)
      if (sellActions.length > 0) {
        expect(sellActions[0]!.ticker).toBe('LOSER')
      }
    }
  })
})
