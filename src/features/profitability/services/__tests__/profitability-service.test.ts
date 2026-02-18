import { describe, it, expect } from 'vitest'
import { generateProfitabilityReport, getDemoReport } from '../profitability-service'
import type { PositionInput } from '../../calculators/types'

describe('generateProfitabilityReport', () => {
  const positions: PositionInput[] = [
    { ticker: 'SBER', name: 'Сбербанк', quantity: 100, currentPrice: 300, costBasis: 25000 },
    { ticker: 'GAZP', name: 'Газпром', quantity: 200, currentPrice: 150, costBasis: 35000 },
  ]

  it('generates a complete report', () => {
    const report = generateProfitabilityReport('user-1', positions, [], [], [], 'all')
    expect(report.userId).toBe('user-1')
    expect(report.period).toBe('all')
    expect(report.portfolioReturn).toBeDefined()
    expect(report.portfolioReturn.positions).toHaveLength(2)
    expect(report.bestPerformers.length).toBeGreaterThan(0)
    expect(report.worstPerformers.length).toBeGreaterThan(0)
  })

  it('includes dividends in return calculation', () => {
    const report = generateProfitabilityReport(
      'user-1',
      positions,
      [{ ticker: 'SBER', date: '2024-07-15', amountPerShare: 33, totalAmount: 3300 }],
      [],
      [],
      'all',
    )
    const sber = report.portfolioReturn.positions.find(p => p.ticker === 'SBER')!
    expect(sber.dividendsReceived).toBe(3300)
    expect(sber.absoluteReturn).toBeGreaterThan(5000) // price return + dividends
  })

  it('deducts commissions from return', () => {
    const report = generateProfitabilityReport(
      'user-1',
      positions,
      [],
      [{ ticker: 'SBER', date: '2024-03-15', amount: 100, broker: 'sberbank' }],
      [],
      'all',
    )
    const sber = report.portfolioReturn.positions.find(p => p.ticker === 'SBER')!
    expect(sber.commissionsPaid).toBe(100)
  })

  it('handles empty portfolio', () => {
    const report = generateProfitabilityReport('user-1', [], [], [], [], 'all')
    expect(report.portfolioReturn.totalCostBasis).toBe(0)
    expect(report.portfolioReturn.positions).toHaveLength(0)
  })
})

describe('getDemoReport', () => {
  it('returns a valid demo report for "all" period', () => {
    const report = getDemoReport('all')
    expect(report.userId).toBe('user-1')
    expect(report.portfolioReturn.positions.length).toBeGreaterThan(0)
    expect(report.portfolioReturn.totalCurrentValue).toBeGreaterThan(0)
  })

  it('returns reports for different periods', () => {
    const allReport = getDemoReport('all')
    const dayReport = getDemoReport('day')
    expect(allReport.period).toBe('all')
    expect(dayReport.period).toBe('day')
  })
})
