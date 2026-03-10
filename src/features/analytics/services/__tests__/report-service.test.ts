import { describe, it, expect } from 'vitest'
import { generateReport, getReportTitle } from '../report-service'
import type { AnalyticsResult, ReportConfig, RiskMetrics } from '../../domain/models'

describe('report-service', () => {
  const mockMetrics: RiskMetrics = {
    volatility: 18, sharpeRatio: 1.1, maxDrawdown: 8,
    maxDrawdownPeriod: { peakDate: '2025-01-01', troughDate: '2025-02-01' },
  }

  const mockResult: AnalyticsResult = {
    portfolioTimeSeries: { points: [], startDate: '', endDate: '', periodReturn: 12 },
    riskMetrics: mockMetrics,
    allocation: {
      byAssetClass: [{ category: 'Акции', value: 100000, percent: 70, color: '#1976d2' }],
      bySector: [],
      byGeography: [],
    },
  }

  it('generates report with config', () => {
    const config: ReportConfig = {
      periodType: 'yearly', year: 2025,
      includeCharts: true, includeTaxBreakdown: false, includeTransactions: false,
    }
    const report = generateReport(config, mockResult)
    expect(report.config).toBe(config)
    expect(report.metrics).toBe(mockMetrics)
    expect(report.portfolioReturn).toBe(12)
    expect(report.taxSummary).toBeUndefined()
    expect(report.transactions).toBeUndefined()
  })

  it('includes tax when configured', () => {
    const config: ReportConfig = {
      periodType: 'yearly', year: 2025,
      includeCharts: true, includeTaxBreakdown: true, includeTransactions: true,
    }
    const taxReport = {
      period: { year: 2025 }, dividendIncome: 5000, dividendTax: 650,
      capitalGains: 3000, capitalGainsTax: 390, taxExemptGains: 0,
      totalTaxLiability: 1040, transactions: [],
    }
    const report = generateReport(config, mockResult, taxReport, [])
    expect(report.taxSummary).toBeDefined()
    expect(report.transactions).toBeDefined()
  })

  it('formats yearly title', () => {
    expect(getReportTitle({ periodType: 'yearly', year: 2025, includeCharts: true, includeTaxBreakdown: true, includeTransactions: true }))
      .toBe('2025 год')
  })

  it('formats monthly title', () => {
    expect(getReportTitle({ periodType: 'monthly', year: 2025, month: 3, includeCharts: true, includeTaxBreakdown: true, includeTransactions: true }))
      .toBe('Март 2025')
  })

  it('formats quarterly title', () => {
    expect(getReportTitle({ periodType: 'quarterly', year: 2025, quarter: 2, includeCharts: true, includeTaxBreakdown: true, includeTransactions: true }))
      .toBe('II квартал 2025')
  })
})
