import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaxSummary } from '../TaxSummary'
import type { TaxReport } from '../../domain/models'

describe('TaxSummary', () => {
  const mockReport: TaxReport = {
    period: { year: 2025 },
    dividendIncome: 30000,
    dividendTax: 3900,
    capitalGains: 10000,
    capitalGainsTax: 1300,
    taxExemptGains: 5000,
    totalTaxLiability: 5200,
    transactions: [
      { date: '2025-03-15', ticker: 'SBER', type: 'dividend', amount: 18500, taxAmount: 2405, isExempt: false },
      { date: '2025-05-22', ticker: 'MOEX', type: 'sale', amount: 2800, taxAmount: 0, isExempt: true, exemptReason: '3+ года владения' },
    ],
  }

  it('renders period title', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('Налоговая сводка — 2025 год')).toBeTruthy()
  })

  it('renders dividend income card', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('Дивиденды')).toBeTruthy()
  })

  it('renders capital gains card', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('Прирост капитала')).toBeTruthy()
  })

  it('renders total tax liability', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('Итого к уплате')).toBeTruthy()
  })

  it('renders transactions table', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('Налогооблагаемые операции')).toBeTruthy()
    expect(screen.getByText('SBER')).toBeTruthy()
    expect(screen.getByText('MOEX')).toBeTruthy()
  })

  it('shows exempt badge', () => {
    render(<TaxSummary report={mockReport} />)
    expect(screen.getByText('3+ года владения')).toBeTruthy()
  })

  it('renders quarterly period', () => {
    const q2Report = { ...mockReport, period: { year: 2025, quarter: 2 } }
    render(<TaxSummary report={q2Report} />)
    expect(screen.getByText('Налоговая сводка — II квартал 2025')).toBeTruthy()
  })
})
