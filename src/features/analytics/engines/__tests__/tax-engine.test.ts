import { describe, it, expect } from 'vitest'
import { computeDividendTax, computeCapitalGainsTax, computeTaxReport } from '../tax-engine'
import type { TaxableTransaction } from '../../domain/models'

describe('tax-engine', () => {
  it('computes 13% dividend tax for normal income', () => {
    const tax = computeDividendTax(10000, 1000000)
    expect(tax).toBe(1300)
  })

  it('computes 15% dividend tax for high income', () => {
    const tax = computeDividendTax(10000, 6000000)
    expect(tax).toBe(1500)
  })

  it('computes capital gains tax', () => {
    const result = computeCapitalGainsTax(50000, 40000, '2025-01-01', 1000000)
    expect(result.tax).toBe(1300)
    expect(result.isExempt).toBe(false)
  })

  it('exempts long-term holdings', () => {
    const result = computeCapitalGainsTax(50000, 40000, '2020-01-01', 1000000)
    expect(result.tax).toBe(0)
    expect(result.isExempt).toBe(true)
    expect(result.exemptReason).toBe('3+ года владения')
  })

  it('returns 0 tax for losses', () => {
    const result = computeCapitalGainsTax(30000, 40000, '2025-01-01', 1000000)
    expect(result.tax).toBe(0)
    expect(result.isExempt).toBe(false)
  })

  it('computes tax report for a period', () => {
    const transactions: TaxableTransaction[] = [
      { date: '2025-03-15', ticker: 'SBER', type: 'dividend', amount: 10000, taxAmount: 1300, isExempt: false },
      { date: '2025-06-20', ticker: 'LKOH', type: 'dividend', amount: 5000, taxAmount: 650, isExempt: false },
      { date: '2025-04-10', ticker: 'GAZP', type: 'sale', amount: 3000, taxAmount: 390, isExempt: false },
      { date: '2024-12-01', ticker: 'MGNT', type: 'dividend', amount: 2000, taxAmount: 260, isExempt: false },
    ]

    const report = computeTaxReport(transactions, { year: 2025 })
    expect(report.dividendIncome).toBe(15000)
    expect(report.dividendTax).toBe(1950)
    expect(report.capitalGains).toBe(3000)
    expect(report.capitalGainsTax).toBe(390)
    expect(report.totalTaxLiability).toBe(2340)
    expect(report.transactions).toHaveLength(3)
  })

  it('filters by quarter', () => {
    const transactions: TaxableTransaction[] = [
      { date: '2025-01-15', ticker: 'A', type: 'dividend', amount: 1000, taxAmount: 130, isExempt: false },
      { date: '2025-04-15', ticker: 'B', type: 'dividend', amount: 2000, taxAmount: 260, isExempt: false },
    ]

    const q1 = computeTaxReport(transactions, { year: 2025, quarter: 1 })
    expect(q1.transactions).toHaveLength(1)
    expect(q1.dividendIncome).toBe(1000)

    const q2 = computeTaxReport(transactions, { year: 2025, quarter: 2 })
    expect(q2.transactions).toHaveLength(1)
    expect(q2.dividendIncome).toBe(2000)
  })

  it('counts exempt gains separately', () => {
    const transactions: TaxableTransaction[] = [
      { date: '2025-05-01', ticker: 'X', type: 'sale', amount: 5000, taxAmount: 0, isExempt: true, exemptReason: '3+ года' },
    ]
    const report = computeTaxReport(transactions, { year: 2025 })
    expect(report.taxExemptGains).toBe(5000)
    expect(report.capitalGains).toBe(0)
    expect(report.totalTaxLiability).toBe(0)
  })
})
