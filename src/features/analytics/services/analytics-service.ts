import type {
  AnalyticsInput,
  AnalyticsResult,
  AllocationBreakdown,
  GeographyBreakdown,
  CorrelationMatrix,
} from '../domain/models'
import type { ViewPosition } from '@/features/portfolio-view/domain/models'
import { ASSET_CLASS_COLORS, SECTOR_COLORS, GEOGRAPHY_REGIONS } from '../domain/constants'
import { buildTimeSeries } from '../engines/time-series-engine'
import { computeRiskMetrics, computeCorrelationMatrix } from '../engines/risk-metrics-engine'
import { compareToBenchmark } from '../engines/benchmark-engine'
import { dailyReturnsFromSeries } from '../engines/time-series-engine'

const ASSET_CLASS_LABELS: Record<string, string> = {
  stock: 'Акции',
  bond: 'Облигации',
  etf: 'ETF',
  currency: 'Валюта',
  other: 'Прочее',
}

const GEOGRAPHY_MAP: Record<string, string> = {
  'SBER': 'Россия', 'SBERP': 'Россия', 'LKOH': 'Россия', 'GAZP': 'Россия',
  'YNDX': 'Россия', 'MGNT': 'Россия', 'GMKN': 'Россия', 'ROSN': 'Россия',
  'MOEX': 'Россия', 'TMOS': 'Россия', 'TBRU': 'Россия', 'VTBM': 'Россия',
  'SU26238': 'Россия', 'SU26240': 'Россия', 'RU000A106Y': 'Россия',
}

export function runAnalytics(input: AnalyticsInput): AnalyticsResult {
  const portfolioTimeSeries = buildTimeSeries(input.snapshots, input.period)
  const riskMetrics = computeRiskMetrics(portfolioTimeSeries.points)

  const benchmark = input.benchmarkData
    ? compareToBenchmark(portfolioTimeSeries, input.benchmarkData)
    : undefined

  const allocation = computeAllocations(input.positions)
  const correlationMatrix = computePortfolioCorrelations(input.snapshots, input.positions)

  return {
    portfolioTimeSeries,
    riskMetrics,
    benchmark,
    allocation,
    correlationMatrix,
  }
}

function computeAllocations(positions: ViewPosition[]): {
  byAssetClass: AllocationBreakdown[]
  bySector: AllocationBreakdown[]
  byGeography: GeographyBreakdown[]
} {
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
  if (totalValue === 0) {
    return { byAssetClass: [], bySector: [], byGeography: [] }
  }

  const byAssetClass = groupAndSort(
    positions,
    p => ASSET_CLASS_LABELS[p.assetClass] ?? p.assetClass,
    totalValue,
    ASSET_CLASS_COLORS,
  )

  const bySector = groupAndSort(
    positions,
    p => p.sector,
    totalValue,
    SECTOR_COLORS,
  )

  const geoMap = new Map<string, number>()
  for (const p of positions) {
    const region = GEOGRAPHY_MAP[p.ticker] ?? 'Прочее'
    geoMap.set(region, (geoMap.get(region) ?? 0) + p.currentValue)
  }

  const byGeography: GeographyBreakdown[] = [...geoMap.entries()]
    .map(([region, value]) => ({
      region,
      value: Math.round(value * 100) / 100,
      percent: Math.round((value / totalValue) * 10000) / 100,
    }))
    .sort((a, b) => b.value - a.value)

  return { byAssetClass, bySector, byGeography }
}

function groupAndSort(
  positions: ViewPosition[],
  keyFn: (p: ViewPosition) => string,
  totalValue: number,
  colors: Record<string, string>,
): AllocationBreakdown[] {
  const map = new Map<string, number>()
  for (const p of positions) {
    const key = keyFn(p)
    map.set(key, (map.get(key) ?? 0) + p.currentValue)
  }

  return [...map.entries()]
    .map(([category, value]) => ({
      category,
      value: Math.round(value * 100) / 100,
      percent: Math.round((value / totalValue) * 10000) / 100,
      color: colors[category] ?? '#757575',
    }))
    .sort((a, b) => b.value - a.value)
}

function computePortfolioCorrelations(
  snapshots: PortfolioSnapshot[],
  positions: ViewPosition[],
): CorrelationMatrix | undefined {
  if (snapshots.length < 10) return undefined

  const tickers = [...new Set(positions.map(p => p.ticker))].slice(0, 8)
  const assetReturns = new Map<string, number[]>()

  for (const ticker of tickers) {
    const tickerValues = snapshots
      .map(s => {
        const pos = s.positions.find(p => p.ticker === ticker)
        return { date: s.date, value: pos?.currentValue ?? 0 }
      })
      .filter(p => p.value > 0)

    if (tickerValues.length >= 10) {
      assetReturns.set(ticker, dailyReturnsFromSeries(tickerValues))
    }
  }

  if (assetReturns.size < 2) return undefined
  return computeCorrelationMatrix(assetReturns)
}

type PortfolioSnapshot = import('../domain/models').PortfolioSnapshot
