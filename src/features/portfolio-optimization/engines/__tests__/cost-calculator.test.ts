import { describe, it, expect } from 'vitest'
import {
  estimateCommission,
  estimateTax,
  calculateImpact,
  isLongTermExempt,
  isCostEffective,
} from '../cost-calculator'
import type { BrokerProfile, PortfolioPosition, TradeAction } from '../../domain/models'

const BROKER: BrokerProfile = {
  broker: 'Сбербанк',
  commissionRate: 0.003, // 0.3%
  minCommission: 50,
  suitableFor: ['long_term'],
}

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

describe('estimateCommission', () => {
  it('calculates commission as rate * amount', () => {
    expect(estimateCommission(100_000, BROKER)).toBe(300) // 0.3% of 100K
  })

  it('uses minimum commission when calculated is below', () => {
    expect(estimateCommission(1000, BROKER)).toBe(50) // 0.3% = 3 RUB < 50 min
  })
})

describe('estimateTax', () => {
  it('calculates 13% NDFL on capital gains', () => {
    const pos = makePosition({ costBasis: 20000, currentValue: 30000 })
    const tax = estimateTax(pos, 30000)
    expect(tax).toBe(1300) // 13% of 10000 gain
  })

  it('returns 0 for positions with losses', () => {
    const pos = makePosition({ costBasis: 40000, currentValue: 30000 })
    expect(estimateTax(pos, 30000)).toBe(0)
  })

  it('returns 0 for long-term holdings (3+ years)', () => {
    const pos = makePosition({ purchaseDate: '2020-01-01' })
    expect(estimateTax(pos, 30000)).toBe(0)
  })

  it('uses 15% rate for high income earners', () => {
    const pos = makePosition({ costBasis: 20000, currentValue: 30000 })
    const tax = estimateTax(pos, 30000, 6_000_000)
    expect(tax).toBe(1500) // 15% of 10000 gain
  })
})

describe('isLongTermExempt', () => {
  it('returns true for holdings over 3 years', () => {
    expect(isLongTermExempt('2020-01-01')).toBe(true)
  })

  it('returns false for recent purchases', () => {
    expect(isLongTermExempt('2025-01-01')).toBe(false)
  })
})

describe('isCostEffective', () => {
  it('returns true when cost is below threshold', () => {
    expect(isCostEffective(100_000, 1000, 0.05)).toBe(true) // 1% < 5%
  })

  it('returns false when cost exceeds threshold', () => {
    expect(isCostEffective(10_000, 1000, 0.05)).toBe(false) // 10% > 5%
  })

  it('returns false for zero trade amount', () => {
    expect(isCostEffective(0, 100)).toBe(false)
  })
})

describe('calculateImpact', () => {
  it('combines commissions and taxes for sell actions', () => {
    const actions: TradeAction[] = [
      { broker: 'Сбербанк', ticker: 'SBER', direction: 'sell', quantity: 100, estimatedPrice: 300, estimatedAmount: 30000 },
    ]
    const positions = [makePosition({ costBasis: 20000 })]

    const impact = calculateImpact(actions, positions, [BROKER], 'Test improvement')

    expect(impact.estimatedCommission).toBe(90) // 0.3% of 30000
    expect(impact.estimatedTax).toBe(1300) // 13% of 10000 gain
    expect(impact.totalCost).toBe(1390)
    expect(impact.portfolioImprovement).toBe('Test improvement')
  })

  it('has zero tax for buy actions', () => {
    const actions: TradeAction[] = [
      { broker: 'Сбербанк', ticker: 'GAZP', direction: 'buy', quantity: 50, estimatedPrice: 200, estimatedAmount: 10000 },
    ]

    const impact = calculateImpact(actions, [], [BROKER], 'Buy improvement')
    expect(impact.estimatedTax).toBe(0)
    expect(impact.estimatedCommission).toBe(50) // min commission
  })
})
