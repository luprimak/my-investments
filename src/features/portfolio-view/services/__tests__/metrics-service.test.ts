import { describe, it, expect } from 'vitest'
import { computeMetrics } from '../metrics-service'
import type { ViewPosition } from '../../domain/models'

const MOCK: ViewPosition[] = [
  {
    ticker: 'SBER', name: 'Сбербанк', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', sector: 'Финансы', currency: 'RUB',
    quantity: 100, currentPrice: 300, currentValue: 30000, costBasis: 25000,
    purchaseDate: '2024-01-01', dailyVolume: 1000000,
    unrealizedGain: 5000, unrealizedGainPercent: 20, portfolioWeight: 60,
  },
  {
    ticker: 'OFZ26238', name: 'ОФЗ 26238', broker: 'alfa', accountType: 'iis',
    assetClass: 'bond', assetSubclass: 'ofz', sector: 'Гос. облигации', currency: 'RUB',
    quantity: 20, currentPrice: 1000, currentValue: 20000, costBasis: 19000,
    purchaseDate: '2024-06-01', dailyVolume: 500000,
    unrealizedGain: 1000, unrealizedGainPercent: 5.26, portfolioWeight: 40,
  },
]

describe('computeMetrics', () => {
  it('computes total value', () => {
    const m = computeMetrics(MOCK)
    expect(m.totalValue).toBe(50000)
  })

  it('computes total cost basis', () => {
    const m = computeMetrics(MOCK)
    expect(m.totalCostBasis).toBe(44000)
  })

  it('computes total gain and percent', () => {
    const m = computeMetrics(MOCK)
    expect(m.totalGain).toBe(6000)
    expect(m.totalGainPercent).toBeCloseTo(13.64, 1)
  })

  it('counts positions and brokers', () => {
    const m = computeMetrics(MOCK)
    expect(m.positionCount).toBe(2)
    expect(m.brokerCount).toBe(2)
  })

  it('computes allocation by asset class', () => {
    const m = computeMetrics(MOCK)
    expect(m.allocationByAssetClass).toHaveLength(2)
    const stocks = m.allocationByAssetClass.find(a => a.category === 'Акции')
    expect(stocks).toBeDefined()
    expect(stocks!.percent).toBeCloseTo(60, 0)
  })

  it('computes allocation by sector', () => {
    const m = computeMetrics(MOCK)
    expect(m.allocationBySector).toHaveLength(2)
  })

  it('returns top holdings sorted by value', () => {
    const m = computeMetrics(MOCK)
    expect(m.topHoldings[0].ticker).toBe('SBER')
  })

  it('handles empty positions', () => {
    const m = computeMetrics([])
    expect(m.totalValue).toBe(0)
    expect(m.totalGain).toBe(0)
    expect(m.totalGainPercent).toBe(0)
    expect(m.positionCount).toBe(0)
    expect(m.brokerCount).toBe(0)
  })
})
