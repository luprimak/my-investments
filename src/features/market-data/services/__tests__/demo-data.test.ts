import { describe, it, expect } from 'vitest'
import {
  DEMO_SECURITIES,
  DEMO_QUOTES,
  DEMO_BOND,
  DEMO_EXCHANGE_RATES,
  generateDemoHistory,
} from '../demo-data'

describe('demo-data', () => {
  it('provides demo securities', () => {
    expect(DEMO_SECURITIES.length).toBeGreaterThan(0)

    const sber = DEMO_SECURITIES.find(s => s.ticker === 'SBER')
    expect(sber).toBeDefined()
    expect(sber!.type).toBe('stock')
    expect(sber!.board).toBe('TQBR')
    expect(sber!.currency).toBe('RUB')
  })

  it('includes different security types', () => {
    const types = new Set(DEMO_SECURITIES.map(s => s.type))
    expect(types.has('stock')).toBe(true)
    expect(types.has('bond_ofz')).toBe(true)
    expect(types.has('etf')).toBe(true)
  })

  it('provides demo quotes with valid data', () => {
    expect(DEMO_QUOTES.length).toBeGreaterThan(0)

    for (const quote of DEMO_QUOTES) {
      expect(quote.ticker).toBeTruthy()
      expect(quote.lastPrice).toBeGreaterThan(0)
      expect(quote.volume).toBeGreaterThan(0)
      expect(quote.marketStatus).toBe('closed')
    }
  })

  it('quotes have matching securities', () => {
    const tickers = new Set(DEMO_SECURITIES.map(s => s.ticker))
    for (const quote of DEMO_QUOTES) {
      expect(tickers.has(quote.ticker)).toBe(true)
    }
  })

  it('provides valid bond data', () => {
    expect(DEMO_BOND.ticker).toBeTruthy()
    expect(DEMO_BOND.faceValue).toBeGreaterThan(0)
    expect(DEMO_BOND.couponRate).toBeGreaterThan(0)
    expect(DEMO_BOND.couponFrequency).toBeGreaterThan(0)
    expect(DEMO_BOND.nkd).toBeGreaterThan(0)
    expect(DEMO_BOND.yieldToMaturity).toBeGreaterThan(0)
  })

  it('provides exchange rates', () => {
    expect(DEMO_EXCHANGE_RATES.length).toBe(3)
    const pairs = DEMO_EXCHANGE_RATES.map(r => r.pair)
    expect(pairs).toContain('USD/RUB')
    expect(pairs).toContain('EUR/RUB')
    expect(pairs).toContain('CNY/RUB')

    for (const rate of DEMO_EXCHANGE_RATES) {
      expect(rate.rate).toBeGreaterThan(0)
    }
  })

  it('generates demo history with correct length', () => {
    const candles = generateDemoHistory('SBER', 30)
    // Weekdays only, so approximately 21-22 candles for 30 days
    expect(candles.length).toBeGreaterThan(15)
    expect(candles.length).toBeLessThanOrEqual(31)
  })

  it('generates history with valid candle data', () => {
    const candles = generateDemoHistory('SBER', 10)
    for (const candle of candles) {
      expect(candle.date).toBeTruthy()
      expect(candle.open).toBeGreaterThan(0)
      expect(candle.high).toBeGreaterThan(0)
      expect(candle.low).toBeGreaterThan(0)
      expect(candle.close).toBeGreaterThan(0)
      expect(candle.high).toBeGreaterThanOrEqual(candle.low)
      expect(candle.volume).toBeGreaterThan(0)
    }
  })

  it('generates history in chronological order', () => {
    const candles = generateDemoHistory('GAZP', 30)
    for (let i = 1; i < candles.length; i++) {
      expect(candles[i]!.date >= candles[i - 1]!.date).toBe(true)
    }
  })

  it('generates empty history for 0 days', () => {
    const candles = generateDemoHistory('SBER', 0)
    // May have 1 candle for today if it's a weekday
    expect(candles.length).toBeLessThanOrEqual(1)
  })
})
