import { describe, it, expect, beforeEach } from 'vitest'
import {
  addPricePoints,
  getPriceHistory,
  getLatestPrice,
  clearHistory,
} from '../price-history-store'

beforeEach(() => {
  clearHistory()
})

describe('price-history-store', () => {
  it('stores and retrieves price points', () => {
    addPricePoints([
      { ticker: 'SBER', date: '2025-01-01', price: 280 },
      { ticker: 'SBER', date: '2025-01-10', price: 290 },
    ])
    const history = getPriceHistory('SBER')
    expect(history).toHaveLength(2)
    expect(history[0]!.price).toBe(280)
  })

  it('returns sorted history', () => {
    addPricePoints([
      { ticker: 'SBER', date: '2025-01-10', price: 290 },
      { ticker: 'SBER', date: '2025-01-01', price: 280 },
    ])
    const history = getPriceHistory('SBER')
    expect(history[0]!.date).toBe('2025-01-01')
    expect(history[1]!.date).toBe('2025-01-10')
  })

  it('returns latest price', () => {
    addPricePoints([
      { ticker: 'SBER', date: '2025-01-01', price: 280 },
      { ticker: 'SBER', date: '2025-01-10', price: 295 },
    ])
    expect(getLatestPrice('SBER')).toBe(295)
  })

  it('returns null for unknown ticker', () => {
    expect(getLatestPrice('UNKNOWN')).toBeNull()
  })

  it('clears history', () => {
    addPricePoints([{ ticker: 'SBER', date: '2025-01-01', price: 280 }])
    clearHistory()
    expect(getPriceHistory('SBER')).toHaveLength(0)
  })

  it('filters by ticker', () => {
    addPricePoints([
      { ticker: 'SBER', date: '2025-01-01', price: 280 },
      { ticker: 'GAZP', date: '2025-01-01', price: 155 },
    ])
    expect(getPriceHistory('SBER')).toHaveLength(1)
    expect(getPriceHistory('GAZP')).toHaveLength(1)
  })
})
