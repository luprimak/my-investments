import type { TimeSeries, BenchmarkComparison } from '../domain/models'
import { BENCHMARK_IMOEX } from '../domain/constants'

export function normalizeSeries(series: TimeSeries): TimeSeries {
  if (series.points.length === 0) return series
  const baseValue = series.points[0]!.value
  if (baseValue === 0) return series

  return {
    ...series,
    points: series.points.map(p => ({
      date: p.date,
      value: (p.value / baseValue) * 100,
    })),
  }
}

export function compareToBenchmark(
  portfolioSeries: TimeSeries,
  benchmarkSeries: TimeSeries,
): BenchmarkComparison {
  const normalizedPortfolio = normalizeSeries(portfolioSeries)
  const normalizedBenchmark = normalizeSeries(benchmarkSeries)

  const portfolioReturn = portfolioSeries.periodReturn
  const benchmarkReturn = benchmarkSeries.periodReturn

  return {
    benchmarkId: BENCHMARK_IMOEX.id,
    benchmarkName: BENCHMARK_IMOEX.name,
    portfolioSeries: normalizedPortfolio,
    benchmarkSeries: normalizedBenchmark,
    portfolioReturn,
    benchmarkReturn,
    alpha: portfolioReturn - benchmarkReturn,
  }
}
