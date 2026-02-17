import { describe, it, expect } from 'vitest'
import { getAllPositions, getPositionsByBroker, getBrokerAccounts } from '../portfolio-service'

describe('getAllPositions', () => {
  it('returns all mock positions', () => {
    const positions = getAllPositions()
    expect(positions.length).toBeGreaterThan(0)
  })

  it('computes portfolio weights that sum to ~100%', () => {
    const positions = getAllPositions()
    const totalWeight = positions.reduce((sum, p) => sum + p.portfolioWeight, 0)
    expect(totalWeight).toBeCloseTo(100, 0)
  })

  it('every position has required fields', () => {
    const positions = getAllPositions()
    for (const p of positions) {
      expect(p.ticker).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(p.broker).toBeTruthy()
      expect(p.currency).toBe('RUB')
      expect(p.currentValue).toBeGreaterThan(0)
    }
  })
})

describe('getPositionsByBroker', () => {
  it('filters positions for sberbank', () => {
    const positions = getPositionsByBroker('sberbank')
    expect(positions.length).toBeGreaterThan(0)
    for (const p of positions) {
      expect(p.broker).toBe('sberbank')
    }
  })

  it('filters positions for vtb', () => {
    const positions = getPositionsByBroker('vtb')
    expect(positions.length).toBeGreaterThan(0)
    for (const p of positions) {
      expect(p.broker).toBe('vtb')
    }
  })

  it('recalculates weights within broker', () => {
    const positions = getPositionsByBroker('sberbank')
    const totalWeight = positions.reduce((sum, p) => sum + p.portfolioWeight, 0)
    expect(totalWeight).toBeCloseTo(100, 0)
  })
})

describe('getBrokerAccounts', () => {
  it('returns accounts for all 4 brokers', () => {
    const accounts = getBrokerAccounts()
    const brokers = new Set(accounts.map(a => a.broker))
    expect(brokers.size).toBe(4)
    expect(brokers.has('sberbank')).toBe(true)
    expect(brokers.has('alfa')).toBe(true)
    expect(brokers.has('tbank')).toBe(true)
    expect(brokers.has('vtb')).toBe(true)
  })

  it('each account has correct totals', () => {
    const accounts = getBrokerAccounts()
    for (const account of accounts) {
      const expectedValue = account.positions.reduce((sum, p) => sum + p.currentValue, 0)
      expect(account.totalValue).toBe(expectedValue)
      expect(account.positionCount).toBe(account.positions.length)
    }
  })

  it('separates accounts by type for VTB', () => {
    const accounts = getBrokerAccounts()
    const vtbAccounts = accounts.filter(a => a.broker === 'vtb')
    expect(vtbAccounts.length).toBeGreaterThanOrEqual(2)
    const types = vtbAccounts.map(a => a.accountType)
    expect(types).toContain('auto_managed')
    expect(types).toContain('trust_management')
  })
})
