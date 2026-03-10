import type {
  ReportConfig,
  GeneratedReport,
  AnalyticsResult,
  TaxReport,
  TaxableTransaction,
} from '../domain/models'

export function generateReport(
  config: ReportConfig,
  analyticsResult: AnalyticsResult,
  taxReport?: TaxReport,
  transactions?: TaxableTransaction[],
): GeneratedReport {
  return {
    config,
    generatedAt: new Date().toISOString(),
    metrics: analyticsResult.riskMetrics,
    allocation: analyticsResult.allocation.byAssetClass,
    portfolioReturn: analyticsResult.portfolioTimeSeries.periodReturn,
    benchmarkReturn: analyticsResult.benchmark?.benchmarkReturn,
    taxSummary: config.includeTaxBreakdown ? taxReport : undefined,
    transactions: config.includeTransactions ? transactions : undefined,
  }
}

export function getReportTitle(config: ReportConfig): string {
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]
  const quarterNames = ['I квартал', 'II квартал', 'III квартал', 'IV квартал']

  switch (config.periodType) {
    case 'monthly':
      return `${monthNames[(config.month ?? 1) - 1]} ${config.year}`
    case 'quarterly':
      return `${quarterNames[(config.quarter ?? 1) - 1]} ${config.year}`
    case 'yearly':
      return `${config.year} год`
  }
}
