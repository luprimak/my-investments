import type { ViewPosition } from '@/features/portfolio-view/domain/models'

export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface TimeSeries {
  points: TimeSeriesPoint[]
  startDate: string
  endDate: string
  periodReturn: number
}

export type AnalysisPeriod = '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'

export interface PortfolioSnapshot {
  date: string
  totalValue: number
  positions: ViewPosition[]
}

export interface RiskMetrics {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPeriod: {
    peakDate: string
    troughDate: string
  }
  beta?: number
}

export interface CorrelationEntry {
  tickerA: string
  tickerB: string
  correlation: number
}

export interface CorrelationMatrix {
  tickers: string[]
  values: number[][]
}

export type BenchmarkId = 'IMOEX'

export interface BenchmarkComparison {
  benchmarkId: BenchmarkId
  benchmarkName: string
  portfolioSeries: TimeSeries
  benchmarkSeries: TimeSeries
  portfolioReturn: number
  benchmarkReturn: number
  alpha: number
}

export interface AllocationBreakdown {
  category: string
  value: number
  percent: number
  color: string
}

export interface GeographyBreakdown {
  region: string
  value: number
  percent: number
}

export interface TaxReport {
  period: { year: number; quarter?: number }
  dividendIncome: number
  dividendTax: number
  capitalGains: number
  capitalGainsTax: number
  taxExemptGains: number
  totalTaxLiability: number
  transactions: TaxableTransaction[]
}

export interface TaxableTransaction {
  date: string
  ticker: string
  type: 'dividend' | 'sale'
  amount: number
  taxAmount: number
  isExempt: boolean
  exemptReason?: string
}

export type ReportPeriodType = 'monthly' | 'quarterly' | 'yearly'

export interface ReportConfig {
  periodType: ReportPeriodType
  year: number
  month?: number
  quarter?: number
  includeCharts: boolean
  includeTaxBreakdown: boolean
  includeTransactions: boolean
}

export interface GeneratedReport {
  config: ReportConfig
  generatedAt: string
  metrics: RiskMetrics
  allocation: AllocationBreakdown[]
  portfolioReturn: number
  benchmarkReturn?: number
  taxSummary?: TaxReport
  transactions?: TaxableTransaction[]
}

export interface AnalyticsInput {
  snapshots: PortfolioSnapshot[]
  positions: ViewPosition[]
  benchmarkData?: TimeSeries
  transactions?: TaxableTransaction[]
  period: AnalysisPeriod
}

export interface AnalyticsResult {
  portfolioTimeSeries: TimeSeries
  riskMetrics: RiskMetrics
  benchmark?: BenchmarkComparison
  allocation: {
    byAssetClass: AllocationBreakdown[]
    bySector: AllocationBreakdown[]
    byGeography: GeographyBreakdown[]
  }
  correlationMatrix?: CorrelationMatrix
}
