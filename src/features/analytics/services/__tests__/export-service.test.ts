import { describe, it, expect } from 'vitest'
import { exportToCsv, exportToHtml } from '../export-service'
import type { GeneratedReport, RiskMetrics } from '../../domain/models'

describe('export-service', () => {
  const mockMetrics: RiskMetrics = {
    volatility: 18, sharpeRatio: 1.1, maxDrawdown: 8,
    maxDrawdownPeriod: { peakDate: '2025-01-01', troughDate: '2025-02-01' },
  }

  const mockReport: GeneratedReport = {
    config: { periodType: 'yearly', year: 2025, includeCharts: true, includeTaxBreakdown: false, includeTransactions: false },
    generatedAt: '2025-12-01T00:00:00Z',
    metrics: mockMetrics,
    allocation: [
      { category: 'Акции', value: 100000, percent: 70, color: '#1976d2' },
      { category: 'Облигации', value: 42857, percent: 30, color: '#2e7d32' },
    ],
    portfolioReturn: 12.5,
  }

  it('exports CSV with headers', () => {
    const csv = exportToCsv(mockReport)
    expect(csv).toContain('Отчёт по портфелю')
    expect(csv).toContain('Доходность портфеля;12.50%')
    expect(csv).toContain('Волатильность;18.00%')
    expect(csv).toContain('Акции;100000.00;70.00')
    expect(csv).toContain('Облигации;42857.00;30.00')
  })

  it('includes tax data in CSV when present', () => {
    const withTax: GeneratedReport = {
      ...mockReport,
      taxSummary: {
        period: { year: 2025 }, dividendIncome: 5000, dividendTax: 650,
        capitalGains: 3000, capitalGainsTax: 390, taxExemptGains: 0,
        totalTaxLiability: 1040, transactions: [],
      },
    }
    const csv = exportToCsv(withTax)
    expect(csv).toContain('Налоговая сводка')
    expect(csv).toContain('5000.00')
  })

  it('exports HTML with structure', () => {
    const html = exportToHtml(mockReport)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Отчёт по портфелю')
    expect(html).toContain('12.50%')
    expect(html).toContain('Акции')
    expect(html).toContain('Облигации')
  })

  it('includes print CSS in HTML', () => {
    const html = exportToHtml(mockReport)
    expect(html).toContain('@media print')
  })
})
