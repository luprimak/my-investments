import type { RiskMetrics, TimeSeriesPoint, CorrelationMatrix } from '../domain/models'
import { TRADING_DAYS_PER_YEAR, RISK_FREE_RATE } from '../domain/constants'
import { dailyReturnsFromSeries } from './time-series-engine'

export function computeVolatility(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0
  const mean = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (dailyReturns.length - 1)
  return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS_PER_YEAR) * 100
}

export function computeSharpeRatio(dailyReturns: number[], riskFreeRate: number): number {
  if (dailyReturns.length < 2) return 0
  const annualizedReturn = computeAnnualizedReturn(dailyReturns)
  const volatility = computeVolatility(dailyReturns) / 100
  if (volatility === 0) return 0
  return (annualizedReturn - riskFreeRate) / volatility
}

function computeAnnualizedReturn(dailyReturns: number[]): number {
  if (dailyReturns.length === 0) return 0
  const totalReturn = dailyReturns.reduce((prod, r) => prod * (1 + r), 1) - 1
  const years = dailyReturns.length / TRADING_DAYS_PER_YEAR
  if (years === 0) return 0
  return Math.pow(1 + totalReturn, 1 / years) - 1
}

export function computeMaxDrawdown(
  series: TimeSeriesPoint[],
): { maxDrawdown: number; peakDate: string; troughDate: string } {
  if (series.length < 2) {
    return { maxDrawdown: 0, peakDate: '', troughDate: '' }
  }

  let maxDrawdown = 0
  let peakValue = series[0]!.value
  let peakDate = series[0]!.date
  let resultPeakDate = ''
  let resultTroughDate = ''

  for (let i = 1; i < series.length; i++) {
    const point = series[i]!
    if (point.value > peakValue) {
      peakValue = point.value
      peakDate = point.date
    }
    const drawdown = peakValue > 0 ? ((peakValue - point.value) / peakValue) * 100 : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
      resultPeakDate = peakDate
      resultTroughDate = point.date
    }
  }

  return { maxDrawdown, peakDate: resultPeakDate, troughDate: resultTroughDate }
}

export function computeCorrelationMatrix(
  assetReturns: Map<string, number[]>,
): CorrelationMatrix {
  const tickers = [...assetReturns.keys()]
  const n = tickers.length
  const values: number[][] = Array.from({ length: n }, () => Array(n).fill(0) as number[])

  for (let i = 0; i < n; i++) {
    values[i]![i] = 1.0
    for (let j = i + 1; j < n; j++) {
      const returnsA = assetReturns.get(tickers[i]!)!
      const returnsB = assetReturns.get(tickers[j]!)!
      const corr = pearsonCorrelation(returnsA, returnsB)
      values[i]![j] = corr
      values[j]![i] = corr
    }
  }

  return { tickers, values }
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 2) return 0

  const meanX = x.slice(0, n).reduce((s, v) => s + v, 0) / n
  const meanY = y.slice(0, n).reduce((s, v) => s + v, 0) / n

  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - meanX
    const dy = y[i]! - meanY
    sumXY += dx * dy
    sumX2 += dx * dx
    sumY2 += dy * dy
  }

  const denom = Math.sqrt(sumX2 * sumY2)
  if (denom === 0) return 0
  return sumXY / denom
}

export function computeRiskMetrics(points: TimeSeriesPoint[]): RiskMetrics {
  const dailyReturns = dailyReturnsFromSeries(points)
  const drawdown = computeMaxDrawdown(points)

  return {
    volatility: computeVolatility(dailyReturns),
    sharpeRatio: computeSharpeRatio(dailyReturns, RISK_FREE_RATE),
    maxDrawdown: drawdown.maxDrawdown,
    maxDrawdownPeriod: {
      peakDate: drawdown.peakDate,
      troughDate: drawdown.troughDate,
    },
  }
}
