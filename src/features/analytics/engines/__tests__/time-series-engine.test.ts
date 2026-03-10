import { describe, it, expect } from 'vitest'
import { buildTimeSeries, filterByPeriod, computePeriodReturn, dailyReturnsFromSeries } from '../time-series-engine'
import type { PortfolioSnapshot, TimeSeries, TimeSeriesPoint } from '../../domain/models'

function makeSnapshots(count: number, startValue: number, endValue: number): PortfolioSnapshot[] {
  const snapshots: PortfolioSnapshot[] = []
  const now = new Date()
  for (let i = count; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const progress = (count - i) / count
    const value = startValue + (endValue - startValue) * progress
    snapshots.push({
      date: date.toISOString().split('T')[0]!,
      totalValue: value,
      positions: [],
    })
  }
  return snapshots
}

describe('time-series-engine', () => {
  it('builds time series from snapshots', () => {
    const snapshots = makeSnapshots(30, 100000, 110000)
    const series = buildTimeSeries(snapshots, 'ALL')
    expect(series.points.length).toBe(snapshots.length)
    expect(series.periodReturn).toBeGreaterThan(0)
  })

  it('returns empty series for empty input', () => {
    const series = buildTimeSeries([], 'ALL')
    expect(series.points).toHaveLength(0)
    expect(series.periodReturn).toBe(0)
  })

  it('filters by period', () => {
    const snapshots = makeSnapshots(365, 100000, 120000)
    const allSeries = buildTimeSeries(snapshots, 'ALL')
    const filtered = filterByPeriod(allSeries, '1M')
    expect(filtered.points.length).toBeLessThan(allSeries.points.length)
    expect(filtered.points.length).toBeGreaterThan(0)
  })

  it('computes period return', () => {
    const series: TimeSeries = {
      points: [
        { date: '2025-01-01', value: 100 },
        { date: '2025-01-02', value: 110 },
      ],
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      periodReturn: 0,
    }
    expect(computePeriodReturn(series)).toBe(10)
  })

  it('returns 0 for single point', () => {
    const series: TimeSeries = {
      points: [{ date: '2025-01-01', value: 100 }],
      startDate: '2025-01-01',
      endDate: '2025-01-01',
      periodReturn: 0,
    }
    expect(computePeriodReturn(series)).toBe(0)
  })

  it('computes daily returns', () => {
    const points: TimeSeriesPoint[] = [
      { date: '2025-01-01', value: 100 },
      { date: '2025-01-02', value: 105 },
      { date: '2025-01-03', value: 110 },
    ]
    const returns = dailyReturnsFromSeries(points)
    expect(returns).toHaveLength(2)
    expect(returns[0]).toBeCloseTo(0.05)
  })
})
