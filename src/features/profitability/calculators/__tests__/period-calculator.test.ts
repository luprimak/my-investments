import { describe, it, expect } from 'vitest'
import { filterByPeriod, getStartDateISO, getClosestPrice } from '../period-calculator'
import type { PricePoint } from '../../domain/models'

describe('getStartDateISO', () => {
  it('returns null for "all" period', () => {
    expect(getStartDateISO('all')).toBeNull()
  })

  it('returns an ISO date string for finite periods', () => {
    const result = getStartDateISO('week')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('filterByPeriod', () => {
  const today = new Date().toISOString().split('T')[0]!

  it('returns all records for "all" period', () => {
    const records = [
      { date: '2020-01-01', value: 1 },
      { date: today, value: 2 },
    ]
    const result = filterByPeriod(records, 'all')
    expect(result).toHaveLength(2)
  })

  it('filters old records for "day" period', () => {
    const records = [
      { date: '2020-01-01', value: 1 },
      { date: today, value: 2 },
    ]
    const result = filterByPeriod(records, 'day')
    expect(result).toHaveLength(1)
    expect(result[0]!.date).toBe(today)
  })
})

describe('getClosestPrice', () => {
  const prices: PricePoint[] = [
    { ticker: 'SBER', date: '2025-01-01', price: 280 },
    { ticker: 'SBER', date: '2025-01-10', price: 290 },
    { ticker: 'SBER', date: '2025-01-20', price: 300 },
  ]

  it('returns closest price to target date', () => {
    const result = getClosestPrice(prices, 'SBER', '2025-01-09')
    expect(result).toBe(290)
  })

  it('returns null for unknown ticker', () => {
    const result = getClosestPrice(prices, 'UNKNOWN', '2025-01-10')
    expect(result).toBeNull()
  })

  it('returns exact match when date matches', () => {
    const result = getClosestPrice(prices, 'SBER', '2025-01-10')
    expect(result).toBe(290)
  })
})
