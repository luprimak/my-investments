import { describe, it, expect } from 'vitest'
import { absoluteCalculator } from '../absolute-calculator'
import type { PositionInput, CalculationContext } from '../types'

const POSITIONS: PositionInput[] = [
  { ticker: 'SBER', name: 'Сбербанк', quantity: 100, currentPrice: 300, costBasis: 25000 },
  { ticker: 'GAZP', name: 'Газпром', quantity: 200, currentPrice: 150, costBasis: 35000 },
]

const CONTEXT: CalculationContext = {
  period: 'all',
  dividends: [
    { ticker: 'SBER', date: '2024-07-15', amountPerShare: 33, totalAmount: 3300 },
    { ticker: 'GAZP', date: '2024-07-10', amountPerShare: 15, totalAmount: 3000 },
  ],
  commissions: [
    { ticker: 'SBER', date: '2024-03-15', amount: 7.5, broker: 'sberbank' },
    { ticker: 'GAZP', date: '2024-02-20', amount: 10, broker: 'tbank' },
  ],
  priceHistory: [],
}

describe('absoluteCalculator', () => {
  it('calculates absolute return per position', () => {
    const results = absoluteCalculator.calculate(POSITIONS, CONTEXT)
    expect(results).toHaveLength(2)

    const sber = results.find(r => r.ticker === 'SBER')!
    // currentValue: 300*100 = 30000, costBasis: 25000, divs: 3300, comm: 7.5
    // return = 30000 - 25000 + 3300 - 7.5 = 8292.5
    expect(sber.absoluteReturn).toBeCloseTo(8292.5, 1)
    expect(sber.currentValue).toBe(30000)
    expect(sber.dividendsReceived).toBe(3300)
    expect(sber.commissionsPaid).toBe(7.5)
  })

  it('calculates negative return correctly', () => {
    const results = absoluteCalculator.calculate(POSITIONS, CONTEXT)
    const gazp = results.find(r => r.ticker === 'GAZP')!
    // currentValue: 150*200 = 30000, costBasis: 35000, divs: 3000, comm: 10
    // return = 30000 - 35000 + 3000 - 10 = -2010
    expect(gazp.absoluteReturn).toBeCloseTo(-2010, 1)
  })

  it('returns zero dividends/commissions when none exist', () => {
    const emptyCtx: CalculationContext = {
      period: 'all',
      dividends: [],
      commissions: [],
      priceHistory: [],
    }
    const results = absoluteCalculator.calculate(POSITIONS, emptyCtx)
    for (const r of results) {
      expect(r.dividendsReceived).toBe(0)
      expect(r.commissionsPaid).toBe(0)
    }
  })

  it('handles empty positions', () => {
    const results = absoluteCalculator.calculate([], CONTEXT)
    expect(results).toHaveLength(0)
  })
})
