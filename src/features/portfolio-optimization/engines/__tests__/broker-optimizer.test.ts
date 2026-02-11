import { describe, it, expect } from 'vitest'
import { analyzeBrokerDistribution } from '../broker-optimizer'
import type { Portfolio, PortfolioPosition, BrokerProfile } from '../../domain/models'

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

const BROKERS: BrokerProfile[] = [
  { broker: 'Сбербанк', commissionRate: 0.003, minCommission: 50, suitableFor: ['long_term'] },
  { broker: 'Альфа', commissionRate: 0.001, minCommission: 10, suitableFor: ['active_trading'] },
  { broker: 'ВТБ', commissionRate: 0.005, minCommission: 100, suitableFor: ['bonds'] },
]

describe('analyzeBrokerDistribution', () => {
  it('computes broker summaries correctly', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ broker: 'Сбербанк', currentValue: 500000 }),
        makePosition({ broker: 'Сбербанк', currentValue: 300000, ticker: 'GAZP' }),
        makePosition({ broker: 'Альфа', currentValue: 200000, ticker: 'LKOH' }),
      ],
      totalValue: 1_000_000,
    }

    const plan = analyzeBrokerDistribution({ portfolio, brokerProfiles: BROKERS })

    expect(plan.currentDistribution).toHaveLength(2)

    const sber = plan.currentDistribution.find(s => s.broker === 'Сбербанк')
    expect(sber).toBeDefined()
    expect(sber!.totalValue).toBe(800000)
    expect(sber!.positionCount).toBe(2)

    const alfa = plan.currentDistribution.find(s => s.broker === 'Альфа')
    expect(alfa).toBeDefined()
    expect(alfa!.totalValue).toBe(200000)
    expect(alfa!.positionCount).toBe(1)
  })

  it('returns no recommendations for single-broker portfolio', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ broker: 'Альфа', currentValue: 500000 }),
        makePosition({ broker: 'Альфа', currentValue: 300000, ticker: 'GAZP' }),
      ],
      totalValue: 800000,
    }

    const plan = analyzeBrokerDistribution({ portfolio, brokerProfiles: BROKERS })
    expect(plan.recommendations).toHaveLength(0)
  })

  it('recommends consolidation for small broker accounts', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ broker: 'Альфа', currentValue: 900000 }),
        makePosition({ broker: 'Альфа', currentValue: 50000, ticker: 'GAZP' }),
        makePosition({ broker: 'ВТБ', currentValue: 30000, ticker: 'OFZ' }),
        makePosition({ broker: 'ВТБ', currentValue: 20000, ticker: 'OFZ2' }),
      ],
      totalValue: 1_000_000,
    }

    const plan = analyzeBrokerDistribution({ portfolio, brokerProfiles: BROKERS })

    // ВТБ has 5% of portfolio with 2 positions — should recommend consolidation
    const consolidateRec = plan.recommendations.find(r =>
      r.id.includes('consolidate') || r.id.includes('high-comm'),
    )
    expect(consolidateRec).toBeDefined()
  })

  it('warns about high commission brokers', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ broker: 'Альфа', currentValue: 500000 }),
        makePosition({ broker: 'ВТБ', currentValue: 500000, ticker: 'GAZP' }),
        makePosition({ broker: 'ВТБ', currentValue: 200000, ticker: 'OFZ' }),
        makePosition({ broker: 'ВТБ', currentValue: 100000, ticker: 'OFZ2' }),
        makePosition({ broker: 'ВТБ', currentValue: 50000, ticker: 'OFZ3' }),
      ],
      totalValue: 1_350_000,
    }

    const plan = analyzeBrokerDistribution({ portfolio, brokerProfiles: BROKERS })

    // ВТБ commission (0.5%) is 5x higher than Альфа (0.1%)
    const highCommRec = plan.recommendations.find(r => r.id.includes('high-comm'))
    expect(highCommRec).toBeDefined()
  })

  it('estimates annual savings', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePosition({ broker: 'Альфа', currentValue: 500000 }),
        makePosition({ broker: 'ВТБ', currentValue: 500000, ticker: 'GAZP' }),
      ],
      totalValue: 1_000_000,
    }

    const plan = analyzeBrokerDistribution({ portfolio, brokerProfiles: BROKERS })
    expect(plan.savingsEstimate).toBeGreaterThan(0)
  })
})
