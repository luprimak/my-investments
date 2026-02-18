import { describe, it, expect } from 'vitest'
import { enrichWithRelativeReturn } from '../relative-calculator'
import type { PositionReturn } from '../../domain/models'

describe('enrichWithRelativeReturn', () => {
  it('calculates relative return as percentage of cost basis', () => {
    const positions: PositionReturn[] = [
      {
        ticker: 'SBER', name: 'Сбербанк',
        costBasis: 25000, currentValue: 30000,
        absoluteReturn: 5000, relativeReturn: 0,
        dividendsReceived: 0, commissionsPaid: 0,
      },
    ]
    const result = enrichWithRelativeReturn(positions)
    // 5000 / 25000 * 100 = 20%
    expect(result[0]!.relativeReturn).toBeCloseTo(20, 1)
  })

  it('handles negative returns', () => {
    const positions: PositionReturn[] = [
      {
        ticker: 'GAZP', name: 'Газпром',
        costBasis: 35000, currentValue: 30000,
        absoluteReturn: -5000, relativeReturn: 0,
        dividendsReceived: 0, commissionsPaid: 0,
      },
    ]
    const result = enrichWithRelativeReturn(positions)
    expect(result[0]!.relativeReturn).toBeCloseTo(-14.29, 1)
  })

  it('returns 0% when cost basis is 0', () => {
    const positions: PositionReturn[] = [
      {
        ticker: 'TEST', name: 'Test',
        costBasis: 0, currentValue: 1000,
        absoluteReturn: 1000, relativeReturn: 0,
        dividendsReceived: 0, commissionsPaid: 0,
      },
    ]
    const result = enrichWithRelativeReturn(positions)
    expect(result[0]!.relativeReturn).toBe(0)
  })
})
