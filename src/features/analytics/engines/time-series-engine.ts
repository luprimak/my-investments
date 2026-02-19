import type { TimeSeries, TimeSeriesPoint, PortfolioSnapshot, AnalysisPeriod } from '../domain/models'
import { ANALYSIS_PERIODS } from '../domain/constants'

export function buildTimeSeries(
  snapshots: PortfolioSnapshot[],
  period: AnalysisPeriod,
): TimeSeries {
  if (snapshots.length === 0) {
    return { points: [], startDate: '', endDate: '', periodReturn: 0 }
  }

  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date))
  const points: TimeSeriesPoint[] = sorted.map(s => ({
    date: s.date,
    value: s.totalValue,
  }))

  const filtered = filterByPeriod(
    { points, startDate: points[0]!.date, endDate: points[points.length - 1]!.date, periodReturn: 0 },
    period,
  )

  return {
    ...filtered,
    periodReturn: computePeriodReturn(filtered),
  }
}

export function filterByPeriod(series: TimeSeries, period: AnalysisPeriod): TimeSeries {
  if (series.points.length === 0) return series

  const endDate = new Date(series.endDate)
  let startDate: Date

  if (period === 'ALL') {
    return series
  } else if (period === 'YTD') {
    startDate = new Date(endDate.getFullYear(), 0, 1)
  } else {
    const config = ANALYSIS_PERIODS[period]
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - config.days)
  }

  const startStr = startDate.toISOString().split('T')[0]!
  const filtered = series.points.filter(p => p.date >= startStr)

  if (filtered.length === 0) return { points: [], startDate: '', endDate: '', periodReturn: 0 }

  return {
    points: filtered,
    startDate: filtered[0]!.date,
    endDate: filtered[filtered.length - 1]!.date,
    periodReturn: 0,
  }
}

export function computePeriodReturn(series: TimeSeries): number {
  if (series.points.length < 2) return 0
  const first = series.points[0]!.value
  const last = series.points[series.points.length - 1]!.value
  if (first === 0) return 0
  return ((last - first) / first) * 100
}

export function dailyReturnsFromSeries(points: TimeSeriesPoint[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!.value
    const curr = points[i]!.value
    if (prev === 0) {
      returns.push(0)
    } else {
      returns.push((curr - prev) / prev)
    }
  }
  return returns
}
