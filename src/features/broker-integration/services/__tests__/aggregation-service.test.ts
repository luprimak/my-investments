import { describe, it, expect } from 'vitest'
import { aggregatePortfolios } from '../aggregation-service'
import type { Portfolio } from '../../domain/models'

const PORTFOLIO_A: Portfolio = {
  brokerId: 'broker-a',
  broker: 'tbank',
  positions: [
    { ticker: 'SBER', isin: 'RU0009029540', name: 'Сбербанк ао', instrumentType: 'stock', quantity: 100, averagePrice: 250, currentPrice: 300, currentValue: 30000, unrealizedPnL: 5000, unrealizedPnLPercent: 20, currency: 'RUB' },
    { ticker: 'GAZP', isin: 'RU0007661625', name: 'Газпром ао', instrumentType: 'stock', quantity: 200, averagePrice: 160, currentPrice: 150, currentValue: 30000, unrealizedPnL: -2000, unrealizedPnLPercent: -6.25, currency: 'RUB' },
  ],
  cash: [{ currency: 'RUB', amount: 5000 }],
  totalValue: 65000,
  syncedAt: '2026-02-18T10:00:00Z',
}

const PORTFOLIO_B: Portfolio = {
  brokerId: 'broker-b',
  broker: 'sberbank',
  positions: [
    { ticker: 'SBER', isin: 'RU0009029540', name: 'Сбербанк ао', instrumentType: 'stock', quantity: 50, averagePrice: 280, currentPrice: 300, currentValue: 15000, unrealizedPnL: 1000, unrealizedPnLPercent: 7.14, currency: 'RUB' },
    { ticker: 'LKOH', isin: 'RU0009024277', name: 'ЛУКОЙЛ ао', instrumentType: 'stock', quantity: 3, averagePrice: 7000, currentPrice: 7250, currentValue: 21750, unrealizedPnL: 750, unrealizedPnLPercent: 3.57, currency: 'RUB' },
  ],
  cash: [{ currency: 'RUB', amount: 3000 }],
  totalValue: 39750,
  syncedAt: '2026-02-17T14:00:00Z',
}

describe('aggregation-service', () => {
  it('aggregates single portfolio', () => {
    const result = aggregatePortfolios([PORTFOLIO_A])
    expect(result.brokers).toHaveLength(1)
    expect(result.consolidatedPositions).toHaveLength(2)
    expect(result.totalValue).toBe(65000)
  })

  it('consolidates same ticker across brokers', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    const sber = result.consolidatedPositions.find(p => p.ticker === 'SBER')!

    expect(sber).toBeDefined()
    expect(sber.totalQuantity).toBe(150) // 100 + 50
    expect(sber.holdings).toHaveLength(2)
    expect(sber.totalValue).toBe(45000) // 30000 + 15000
  })

  it('calculates weighted average price', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    const sber = result.consolidatedPositions.find(p => p.ticker === 'SBER')!

    // (100 * 250 + 50 * 280) / 150 = (25000 + 14000) / 150 = 260
    expect(sber.weightedAveragePrice).toBeCloseTo(260, 0)
  })

  it('calculates total PnL', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    const sber = result.consolidatedPositions.find(p => p.ticker === 'SBER')!

    // totalValue (45000) - costBasis (150 * 260 = 39000) = 6000
    expect(sber.totalPnL).toBeCloseTo(6000, 0)
  })

  it('keeps unique positions separate', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    const gazp = result.consolidatedPositions.find(p => p.ticker === 'GAZP')!
    const lkoh = result.consolidatedPositions.find(p => p.ticker === 'LKOH')!

    expect(gazp.holdings).toHaveLength(1)
    expect(gazp.holdings[0]!.broker).toBe('tbank')

    expect(lkoh.holdings).toHaveLength(1)
    expect(lkoh.holdings[0]!.broker).toBe('sberbank')
  })

  it('sorts consolidated positions by value descending', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    for (let i = 1; i < result.consolidatedPositions.length; i++) {
      expect(result.consolidatedPositions[i]!.totalValue)
        .toBeLessThanOrEqual(result.consolidatedPositions[i - 1]!.totalValue)
    }
  })

  it('uses oldest sync time', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    expect(result.syncedAt).toBe('2026-02-17T14:00:00Z')
  })

  it('handles empty portfolios', () => {
    const result = aggregatePortfolios([])
    expect(result.consolidatedPositions).toHaveLength(0)
    expect(result.totalValue).toBe(0)
    expect(result.totalPnL).toBe(0)
  })

  it('sums total value across brokers', () => {
    const result = aggregatePortfolios([PORTFOLIO_A, PORTFOLIO_B])
    expect(result.totalValue).toBe(65000 + 39750)
  })
})
