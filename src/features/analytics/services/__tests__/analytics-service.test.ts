import { describe, it, expect } from 'vitest'
import { runAnalytics } from '../analytics-service'
import type { AnalyticsInput, PortfolioSnapshot } from '../../domain/models'
import type { ViewPosition } from '@/features/portfolio-view/domain/models'

const mockPositions: ViewPosition[] = [
  {
    ticker: 'SBER', name: 'Сбербанк', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', sector: 'Финансы', currency: 'RUB',
    quantity: 100, currentPrice: 295, currentValue: 29500, costBasis: 24000,
    purchaseDate: '2024-03-15', dailyVolume: 45000000,
    unrealizedGain: 5500, unrealizedGainPercent: 22.9, portfolioWeight: 50,
  },
  {
    ticker: 'SU26238', name: 'ОФЗ 26238', broker: 'alfa', accountType: 'iis',
    assetClass: 'bond', assetSubclass: 'ofz', sector: 'Гос. облигации', currency: 'RUB',
    quantity: 50, currentPrice: 620, currentValue: 31000, costBasis: 30000,
    purchaseDate: '2024-06-01', dailyVolume: 500000,
    unrealizedGain: 1000, unrealizedGainPercent: 3.33, portfolioWeight: 50,
  },
]

function makeSnapshots(positions: ViewPosition[]): PortfolioSnapshot[] {
  const snapshots: PortfolioSnapshot[] = []
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const total = positions.reduce((s, p) => s + p.currentValue, 0)
    const noise = Math.sin(i * 0.5) * 500
    snapshots.push({
      date: date.toISOString().split('T')[0]!,
      totalValue: total + noise,
      positions,
    })
  }
  return snapshots
}

describe('analytics-service', () => {
  it('computes analytics result', () => {
    const input: AnalyticsInput = {
      snapshots: makeSnapshots(mockPositions),
      positions: mockPositions,
      period: 'ALL',
    }
    const result = runAnalytics(input)
    expect(result.portfolioTimeSeries.points.length).toBeGreaterThan(0)
    expect(result.riskMetrics.volatility).toBeGreaterThanOrEqual(0)
    expect(result.allocation.byAssetClass.length).toBeGreaterThan(0)
    expect(result.allocation.bySector.length).toBeGreaterThan(0)
    expect(result.allocation.byGeography.length).toBeGreaterThan(0)
  })

  it('computes allocation by asset class', () => {
    const input: AnalyticsInput = {
      snapshots: makeSnapshots(mockPositions),
      positions: mockPositions,
      period: 'ALL',
    }
    const result = runAnalytics(input)
    const classes = result.allocation.byAssetClass.map(a => a.category)
    expect(classes).toContain('Акции')
    expect(classes).toContain('Облигации')
  })

  it('computes allocation by sector', () => {
    const input: AnalyticsInput = {
      snapshots: makeSnapshots(mockPositions),
      positions: mockPositions,
      period: 'ALL',
    }
    const result = runAnalytics(input)
    const sectors = result.allocation.bySector.map(a => a.category)
    expect(sectors).toContain('Финансы')
    expect(sectors).toContain('Гос. облигации')
  })

  it('includes benchmark when provided', () => {
    const input: AnalyticsInput = {
      snapshots: makeSnapshots(mockPositions),
      positions: mockPositions,
      benchmarkData: {
        points: [
          { date: '2025-01-01', value: 3200 },
          { date: '2025-02-01', value: 3300 },
        ],
        startDate: '2025-01-01',
        endDate: '2025-02-01',
        periodReturn: 3.125,
      },
      period: 'ALL',
    }
    const result = runAnalytics(input)
    expect(result.benchmark).toBeDefined()
    expect(result.benchmark!.benchmarkName).toBe('Индекс МосБиржи')
  })

  it('handles empty positions', () => {
    const input: AnalyticsInput = {
      snapshots: [],
      positions: [],
      period: 'ALL',
    }
    const result = runAnalytics(input)
    expect(result.allocation.byAssetClass).toHaveLength(0)
    expect(result.portfolioTimeSeries.points).toHaveLength(0)
  })
})
