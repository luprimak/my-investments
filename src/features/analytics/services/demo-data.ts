import type {
  PortfolioSnapshot,
  TimeSeries,
  TimeSeriesPoint,
  TaxableTransaction,
  AnalysisPeriod,
  AnalyticsResult,
} from '../domain/models'
import type { ViewPosition } from '@/features/portfolio-view/domain/models'
import { getAllPositions } from '@/features/portfolio-view/services/portfolio-service'
import { runAnalytics } from './analytics-service'

function generateSnapshots(positions: ViewPosition[], days: number): PortfolioSnapshot[] {
  const snapshots: PortfolioSnapshot[] = []
  const baseTotal = positions.reduce((s, p) => s + p.costBasis, 0)
  const currentTotal = positions.reduce((s, p) => s + p.currentValue, 0)
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const progress = (days - i) / days
    const trend = baseTotal + (currentTotal - baseTotal) * progress
    const noise = (Math.sin(i * 0.3) * 0.02 + Math.cos(i * 0.7) * 0.015) * trend
    const totalValue = Math.round((trend + noise) * 100) / 100

    const snapshotPositions = positions.map(p => {
      const posProgress = p.costBasis + (p.currentValue - p.costBasis) * progress
      const posNoise = (Math.sin(i * 0.5 + p.ticker.charCodeAt(0)) * 0.03) * posProgress
      const posValue = Math.max(0, posProgress + posNoise)
      return {
        ...p,
        currentValue: Math.round(posValue * 100) / 100,
        currentPrice: p.quantity > 0 ? Math.round((posValue / p.quantity) * 100) / 100 : 0,
      }
    })

    snapshots.push({
      date: date.toISOString().split('T')[0]!,
      totalValue,
      positions: snapshotPositions,
    })
  }

  return snapshots
}

function generateBenchmarkSeries(days: number): TimeSeries {
  const points: TimeSeriesPoint[] = []
  const now = new Date()
  const baseValue = 3200

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const progress = (days - i) / days
    const trend = baseValue * (1 + 0.12 * progress)
    const noise = Math.sin(i * 0.4) * 50 + Math.cos(i * 0.9) * 30
    const value = Math.round((trend + noise) * 100) / 100

    points.push({
      date: date.toISOString().split('T')[0]!,
      value,
    })
  }

  if (points.length < 2) {
    return { points, startDate: '', endDate: '', periodReturn: 0 }
  }

  const firstVal = points[0]!.value
  const lastVal = points[points.length - 1]!.value
  const periodReturn = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0

  return {
    points,
    startDate: points[0]!.date,
    endDate: points[points.length - 1]!.date,
    periodReturn: Math.round(periodReturn * 100) / 100,
  }
}

function generateTaxTransactions(): TaxableTransaction[] {
  return [
    {
      date: '2025-03-15', ticker: 'SBER', type: 'dividend',
      amount: 18500, taxAmount: 2405, isExempt: false,
    },
    {
      date: '2025-06-20', ticker: 'LKOH', type: 'dividend',
      amount: 6300, taxAmount: 819, isExempt: false,
    },
    {
      date: '2025-04-10', ticker: 'GAZP', type: 'sale',
      amount: 4200, taxAmount: 546, isExempt: false,
    },
    {
      date: '2025-07-01', ticker: 'GMKN', type: 'dividend',
      amount: 3800, taxAmount: 494, isExempt: false,
    },
    {
      date: '2025-09-15', ticker: 'ROSN', type: 'dividend',
      amount: 5100, taxAmount: 663, isExempt: false,
    },
    {
      date: '2025-05-22', ticker: 'MOEX', type: 'sale',
      amount: 2800, taxAmount: 0, isExempt: true, exemptReason: '3+ года владения',
    },
    {
      date: '2025-08-12', ticker: 'MGNT', type: 'dividend',
      amount: 2400, taxAmount: 312, isExempt: false,
    },
    {
      date: '2025-11-05', ticker: 'SBERP', type: 'dividend',
      amount: 7000, taxAmount: 910, isExempt: false,
    },
  ]
}

export function getDemoAnalytics(period: AnalysisPeriod): AnalyticsResult {
  const positions = getAllPositions()
  const snapshots = generateSnapshots(positions, 365)
  const benchmarkData = generateBenchmarkSeries(365)
  const transactions = generateTaxTransactions()

  return runAnalytics({
    snapshots,
    positions,
    benchmarkData,
    transactions,
    period,
  })
}

export function getDemoSnapshots(): PortfolioSnapshot[] {
  return generateSnapshots(getAllPositions(), 365)
}

export function getDemoBenchmarkSeries(): TimeSeries {
  return generateBenchmarkSeries(365)
}

export function getDemoTaxTransactions(): TaxableTransaction[] {
  return generateTaxTransactions()
}
