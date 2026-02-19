import { describe, it, expect } from 'vitest'
import { normalizeSeries, compareToBenchmark } from '../benchmark-engine'
import type { TimeSeries } from '../../domain/models'

describe('benchmark-engine', () => {
  it('normalizes series to base 100', () => {
    const series: TimeSeries = {
      points: [
        { date: '2025-01-01', value: 200 },
        { date: '2025-01-02', value: 220 },
        { date: '2025-01-03', value: 210 },
      ],
      startDate: '2025-01-01',
      endDate: '2025-01-03',
      periodReturn: 5,
    }
    const normalized = normalizeSeries(series)
    expect(normalized.points[0]!.value).toBe(100)
    expect(normalized.points[1]!.value).toBe(110)
    expect(normalized.points[2]!.value).toBe(105)
  })

  it('handles empty series', () => {
    const series: TimeSeries = {
      points: [],
      startDate: '',
      endDate: '',
      periodReturn: 0,
    }
    const normalized = normalizeSeries(series)
    expect(normalized.points).toHaveLength(0)
  })

  it('compares portfolio to benchmark', () => {
    const portfolio: TimeSeries = {
      points: [
        { date: '2025-01-01', value: 100000 },
        { date: '2025-01-02', value: 115000 },
      ],
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      periodReturn: 15,
    }
    const benchmark: TimeSeries = {
      points: [
        { date: '2025-01-01', value: 3200 },
        { date: '2025-01-02', value: 3520 },
      ],
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      periodReturn: 10,
    }
    const comparison = compareToBenchmark(portfolio, benchmark)
    expect(comparison.portfolioReturn).toBe(15)
    expect(comparison.benchmarkReturn).toBe(10)
    expect(comparison.alpha).toBe(5)
    expect(comparison.benchmarkName).toBe('Индекс МосБиржи')
  })
})
