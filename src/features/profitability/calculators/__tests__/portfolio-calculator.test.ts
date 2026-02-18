import { describe, it, expect } from 'vitest'
import { aggregatePortfolio, extractPerformers } from '../portfolio-calculator'
import type { PositionReturn } from '../../domain/models'

const POSITIONS: PositionReturn[] = [
  {
    ticker: 'SBER', name: 'Сбербанк',
    costBasis: 25000, currentValue: 30000,
    absoluteReturn: 5000, relativeReturn: 20,
    dividendsReceived: 3000, commissionsPaid: 10,
  },
  {
    ticker: 'GAZP', name: 'Газпром',
    costBasis: 35000, currentValue: 30000,
    absoluteReturn: -5000, relativeReturn: -14.29,
    dividendsReceived: 2000, commissionsPaid: 15,
  },
  {
    ticker: 'YNDX', name: 'Яндекс',
    costBasis: 30000, currentValue: 39500,
    absoluteReturn: 9500, relativeReturn: 31.67,
    dividendsReceived: 0, commissionsPaid: 90,
  },
]

describe('aggregatePortfolio', () => {
  it('sums total values correctly', () => {
    const result = aggregatePortfolio(POSITIONS, 'all')
    expect(result.totalCostBasis).toBe(90000)
    expect(result.totalCurrentValue).toBe(99500)
    expect(result.totalAbsoluteReturn).toBe(9500)
  })

  it('calculates total relative return', () => {
    const result = aggregatePortfolio(POSITIONS, 'all')
    // 9500 / 90000 * 100 = 10.56%
    expect(result.totalRelativeReturn).toBeCloseTo(10.56, 1)
  })

  it('sums dividends and commissions', () => {
    const result = aggregatePortfolio(POSITIONS, 'all')
    expect(result.totalDividends).toBe(5000)
    expect(result.totalCommissions).toBe(115)
  })

  it('preserves period', () => {
    const result = aggregatePortfolio(POSITIONS, 'month')
    expect(result.period).toBe('month')
  })

  it('handles empty positions', () => {
    const result = aggregatePortfolio([], 'all')
    expect(result.totalCostBasis).toBe(0)
    expect(result.totalRelativeReturn).toBe(0)
  })
})

describe('extractPerformers', () => {
  it('returns top 3 best and worst performers', () => {
    const { best, worst } = extractPerformers(POSITIONS, 3)
    expect(best[0]!.ticker).toBe('YNDX')
    expect(best[1]!.ticker).toBe('SBER')
    expect(worst[0]!.ticker).toBe('GAZP')
  })

  it('handles fewer positions than requested count', () => {
    const { best, worst } = extractPerformers(POSITIONS.slice(0, 1), 3)
    expect(best).toHaveLength(1)
    expect(worst).toHaveLength(1)
  })
})
