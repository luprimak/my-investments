import { describe, it, expect } from 'vitest'
import {
  computeVolatility,
  computeSharpeRatio,
  computeMaxDrawdown,
  computeCorrelationMatrix,
  computeRiskMetrics,
} from '../risk-metrics-engine'
import type { TimeSeriesPoint } from '../../domain/models'

describe('risk-metrics-engine', () => {
  it('computes volatility for daily returns', () => {
    const returns = [0.01, -0.005, 0.02, -0.01, 0.015, -0.008, 0.012]
    const vol = computeVolatility(returns)
    expect(vol).toBeGreaterThan(0)
    expect(vol).toBeLessThan(100)
  })

  it('returns 0 volatility for insufficient data', () => {
    expect(computeVolatility([])).toBe(0)
    expect(computeVolatility([0.01])).toBe(0)
  })

  it('computes Sharpe ratio', () => {
    const returns = [0.01, 0.015, 0.008, 0.012, 0.009, 0.011, 0.013]
    const sharpe = computeSharpeRatio(returns, 0.05)
    expect(typeof sharpe).toBe('number')
  })

  it('computes max drawdown', () => {
    const series: TimeSeriesPoint[] = [
      { date: '2025-01-01', value: 100 },
      { date: '2025-01-02', value: 110 },
      { date: '2025-01-03', value: 95 },
      { date: '2025-01-04', value: 105 },
      { date: '2025-01-05', value: 108 },
    ]
    const result = computeMaxDrawdown(series)
    expect(result.maxDrawdown).toBeGreaterThan(0)
    expect(result.peakDate).toBe('2025-01-02')
    expect(result.troughDate).toBe('2025-01-03')
  })

  it('returns 0 drawdown for monotonically increasing', () => {
    const series: TimeSeriesPoint[] = [
      { date: '2025-01-01', value: 100 },
      { date: '2025-01-02', value: 110 },
      { date: '2025-01-03', value: 120 },
    ]
    const result = computeMaxDrawdown(series)
    expect(result.maxDrawdown).toBe(0)
  })

  it('computes correlation matrix', () => {
    const data = new Map<string, number[]>()
    data.set('A', [0.01, 0.02, -0.01, 0.015, -0.005])
    data.set('B', [0.01, 0.018, -0.008, 0.012, -0.003])
    data.set('C', [-0.01, -0.02, 0.01, -0.015, 0.005])

    const matrix = computeCorrelationMatrix(data)
    expect(matrix.tickers).toEqual(['A', 'B', 'C'])
    expect(matrix.values).toHaveLength(3)
    // Diagonal should be 1
    expect(matrix.values[0]![0]).toBe(1)
    expect(matrix.values[1]![1]).toBe(1)
    // A and B should be positively correlated
    expect(matrix.values[0]![1]).toBeGreaterThan(0)
    // A and C should be negatively correlated
    expect(matrix.values[0]![2]).toBeLessThan(0)
  })

  it('computes risk metrics from points', () => {
    const points: TimeSeriesPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      value: 100000 + Math.sin(i * 0.5) * 2000,
    }))
    const metrics = computeRiskMetrics(points)
    expect(metrics.volatility).toBeGreaterThan(0)
    expect(metrics.maxDrawdown).toBeGreaterThanOrEqual(0)
    expect(typeof metrics.sharpeRatio).toBe('number')
  })
})
