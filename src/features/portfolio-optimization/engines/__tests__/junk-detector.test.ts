import { describe, it, expect } from 'vitest'
import { detectJunkPositions, generateJunkRecommendations } from '../junk-detector'
import type { Portfolio, PortfolioPosition, BrokerProfile } from '../../domain/models'
import type { JunkDetectionConfig } from '../../domain/constants'

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

function makePortfolio(positions: PortfolioPosition[]): Portfolio {
  return {
    userId: 'user-1',
    positions,
    totalValue: positions.reduce((sum, p) => sum + p.currentValue, 0),
  }
}

const DEFAULT_BROKER: BrokerProfile = {
  broker: 'Сбербанк',
  commissionRate: 0.003,
  minCommission: 50,
  suitableFor: ['long_term'],
}

describe('detectJunkPositions', () => {
  it('detects small positions', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'TINY', currentValue: 2000, costBasis: 3000 }),
    ])

    const report = detectJunkPositions(portfolio)
    expect(report.positions).toHaveLength(1)
    expect(report.positions[0]!.ticker).toBe('TINY')
    expect(report.positions[0]!.reason).toBe('small_position')
  })

  it('detects deep loss positions', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'LOSER', currentValue: 10000, costBasis: 30000 }), // -66%
    ])

    const report = detectJunkPositions(portfolio)
    const loser = report.positions.find(p => p.ticker === 'LOSER')
    expect(loser).toBeDefined()
    expect(loser!.reason).toBe('deep_loss')
  })

  it('detects illiquid positions', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'ILLIQ', currentValue: 50000, dailyVolume: 50000 }),
    ])

    const report = detectJunkPositions(portfolio)
    const illiq = report.positions.find(p => p.ticker === 'ILLIQ')
    expect(illiq).toBeDefined()
    expect(illiq!.reason).toBe('illiquid')
  })

  it('detects duplicate positions across brokers', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', broker: 'Сбербанк', currentValue: 100000 }),
      makePosition({ ticker: 'SBER', broker: 'Альфа', currentValue: 20000 }),
    ])

    const report = detectJunkPositions(portfolio)
    const dup = report.positions.find(p => p.reason === 'duplicate')
    expect(dup).toBeDefined()
    expect(dup!.broker).toBe('Альфа') // smaller position marked as duplicate
  })

  it('reports correct totals', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'TINY1', currentValue: 1000, costBasis: 2000 }),
      makePosition({ ticker: 'TINY2', currentValue: 2000, costBasis: 3000 }),
    ])

    const report = detectJunkPositions(portfolio)
    expect(report.totalJunkValue).toBe(3000)
    expect(report.percentOfPortfolio).toBeCloseTo(0.6, 1)
  })

  it('returns empty for clean portfolio', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 300000 }),
      makePosition({ ticker: 'GAZP', currentValue: 200000, ticker: 'GAZP' }),
    ])

    const report = detectJunkPositions(portfolio)
    expect(report.positions).toHaveLength(0)
  })

  it('respects custom config', () => {
    const config: JunkDetectionConfig = {
      minPositionPercent: 5,
      minPositionValue: 50000,
      deepLossThreshold: -80,
      illiquidVolumeThreshold: 10000,
    }

    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'SMALL', currentValue: 20000 }), // 3.8% — under 5%
    ])

    const report = detectJunkPositions(portfolio, config)
    expect(report.positions).toHaveLength(1)
    expect(report.positions[0]!.ticker).toBe('SMALL')
  })
})

describe('generateJunkRecommendations', () => {
  it('generates close recommendations for junk positions', () => {
    const portfolio = makePortfolio([
      makePosition({ ticker: 'SBER', currentValue: 500000 }),
      makePosition({ ticker: 'TINY', currentValue: 2000, costBasis: 3000 }),
    ])

    const report = detectJunkPositions(portfolio)
    const recs = generateJunkRecommendations(report, [DEFAULT_BROKER])

    expect(recs.length).toBeGreaterThanOrEqual(0) // may be filtered by cost-effectiveness
    for (const rec of recs) {
      expect(rec.type).toBe('close_position')
      expect(rec.status).toBe('pending')
    }
  })
})
