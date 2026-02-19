import { describe, it, expect } from 'vitest'
import { DEMO_CONNECTIONS, DEMO_PORTFOLIOS, DEMO_TRANSACTIONS, getDemoAggregatedPortfolio } from '../demo-data'

describe('demo-data', () => {
  it('provides 4 broker connections', () => {
    expect(DEMO_CONNECTIONS).toHaveLength(4)
    const brokers = DEMO_CONNECTIONS.map(c => c.broker)
    expect(brokers).toContain('tbank')
    expect(brokers).toContain('sberbank')
    expect(brokers).toContain('alfa')
    expect(brokers).toContain('vtb')
  })

  it('connections have valid structure', () => {
    for (const conn of DEMO_CONNECTIONS) {
      expect(conn.id).toBeTruthy()
      expect(conn.displayName).toBeTruthy()
      expect(conn.connectionType).toBeTruthy()
      expect(conn.status).toBeTruthy()
      expect(conn.createdAt).toBeTruthy()
    }
  })

  it('provides 4 portfolios matching connections', () => {
    expect(DEMO_PORTFOLIOS).toHaveLength(4)
    const connIds = new Set(DEMO_CONNECTIONS.map(c => c.id))
    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(connIds.has(portfolio.brokerId)).toBe(true)
    }
  })

  it('portfolios have valid positions', () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      for (const pos of portfolio.positions) {
        expect(pos.ticker).toBeTruthy()
        expect(pos.name).toBeTruthy()
        expect(pos.quantity).toBeGreaterThan(0)
        expect(pos.currentPrice).toBeGreaterThan(0)
        expect(pos.currentValue).toBeGreaterThan(0)
      }
    }
  })

  it('portfolios have calculated total values', () => {
    for (const portfolio of DEMO_PORTFOLIOS) {
      expect(portfolio.totalValue).toBeGreaterThan(0)
    }
  })

  it('provides transactions', () => {
    expect(DEMO_TRANSACTIONS.length).toBeGreaterThan(0)
    for (const tx of DEMO_TRANSACTIONS) {
      expect(tx.id).toBeTruthy()
      expect(tx.date).toBeTruthy()
      expect(tx.type).toBeTruthy()
      expect(tx.amount).toBeGreaterThan(0)
      expect(tx.description).toBeTruthy()
    }
  })

  it('transactions reference valid brokers', () => {
    const connIds = new Set(DEMO_CONNECTIONS.map(c => c.id))
    for (const tx of DEMO_TRANSACTIONS) {
      expect(connIds.has(tx.brokerId)).toBe(true)
    }
  })

  it('generates aggregated portfolio', () => {
    const agg = getDemoAggregatedPortfolio()
    expect(agg.brokers).toHaveLength(4)
    expect(agg.consolidatedPositions.length).toBeGreaterThan(0)
    expect(agg.totalValue).toBeGreaterThan(0)
  })

  it('SBER is consolidated across brokers', () => {
    const agg = getDemoAggregatedPortfolio()
    const sber = agg.consolidatedPositions.find(p => p.ticker === 'SBER')
    expect(sber).toBeDefined()
    expect(sber!.holdings.length).toBeGreaterThanOrEqual(2)
    expect(sber!.totalQuantity).toBe(150) // 100 tbank + 50 alfa
  })

  it('LKOH is consolidated across brokers', () => {
    const agg = getDemoAggregatedPortfolio()
    const lkoh = agg.consolidatedPositions.find(p => p.ticker === 'LKOH')
    expect(lkoh).toBeDefined()
    expect(lkoh!.holdings.length).toBe(2) // tbank + vtb
    expect(lkoh!.totalQuantity).toBe(5) // 3 + 2
  })
})
