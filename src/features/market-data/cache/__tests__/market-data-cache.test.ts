import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { cacheGet, cacheSet, cacheInvalidate, cacheReset } from '../market-data-cache'

describe('market-data-cache', () => {
  beforeEach(() => {
    cacheReset()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and retrieves values', () => {
    cacheSet('quote', 'SBER', { price: 300 })
    const result = cacheGet<{ price: number }>('quote', 'SBER')
    expect(result).toEqual({ price: 300 })
  })

  it('returns null for missing keys', () => {
    const result = cacheGet('quote', 'NONEXISTENT')
    expect(result).toBeNull()
  })

  it('expires entries after TTL', () => {
    cacheSet('quote', 'SBER', { price: 300 })

    // Quote TTL is 60_000ms
    vi.advanceTimersByTime(61_000)

    const result = cacheGet('quote', 'SBER')
    expect(result).toBeNull()
  })

  it('returns value before TTL expires', () => {
    cacheSet('quote', 'SBER', { price: 300 })
    vi.advanceTimersByTime(30_000)

    const result = cacheGet<{ price: number }>('quote', 'SBER')
    expect(result).toEqual({ price: 300 })
  })

  it('invalidates a specific key', () => {
    cacheSet('quote', 'SBER', { price: 300 })
    cacheSet('quote', 'GAZP', { price: 150 })

    cacheInvalidate('quote', 'SBER')

    expect(cacheGet('quote', 'SBER')).toBeNull()
    expect(cacheGet('quote', 'GAZP')).toEqual({ price: 150 })
  })

  it('invalidates entire tier', () => {
    cacheSet('quote', 'SBER', { price: 300 })
    cacheSet('quote', 'GAZP', { price: 150 })

    cacheInvalidate('quote')

    expect(cacheGet('quote', 'SBER')).toBeNull()
    expect(cacheGet('quote', 'GAZP')).toBeNull()
  })

  it('cacheReset clears all tiers', () => {
    cacheSet('quote', 'SBER', { price: 300 })
    cacheSet('security:meta', 'SBER', { name: 'Сбербанк' })

    cacheReset()

    expect(cacheGet('quote', 'SBER')).toBeNull()
    expect(cacheGet('security:meta', 'SBER')).toBeNull()
  })

  it('evicts oldest entry when maxEntries is reached', () => {
    // exchange_rate tier has maxEntries: 10
    for (let i = 0; i < 11; i++) {
      cacheSet('exchange_rate', `pair-${i}`, { rate: i })
    }

    // First entry should have been evicted
    expect(cacheGet('exchange_rate', 'pair-0')).toBeNull()
    // Last entry should exist
    expect(cacheGet<{ rate: number }>('exchange_rate', 'pair-10')).toEqual({ rate: 10 })
  })

  it('ignores unknown tiers', () => {
    cacheSet('unknown_tier', 'key', 'value')
    expect(cacheGet('unknown_tier', 'key')).toBeNull()
  })
})
