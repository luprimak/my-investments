import { describe, it, expect, beforeEach } from 'vitest'
import { ManualAdapter } from '../manual-adapter'
import type { Position } from '../../domain/models'

describe('ManualAdapter', () => {
  let adapter: ManualAdapter

  beforeEach(() => {
    adapter = new ManualAdapter('test-manual-1')
    localStorage.clear()
  })

  it('connects successfully', async () => {
    const result = await adapter.connect()
    expect(result.success).toBe(true)
    expect(result.brokerId).toBe('test-manual-1')
  })

  it('validates connection', async () => {
    expect(await adapter.validateConnection()).toBe(true)
  })

  it('returns empty portfolio initially', async () => {
    const portfolio = await adapter.getPortfolio()
    expect(portfolio.positions).toHaveLength(0)
    expect(portfolio.broker).toBe('manual')
    expect(portfolio.brokerId).toBe('test-manual-1')
  })

  it('adds a position', async () => {
    const position: Position = {
      ticker: 'SBER',
      isin: 'RU0009029540',
      name: 'Сбербанк ао',
      instrumentType: 'stock',
      quantity: 100,
      averagePrice: 250,
      currentPrice: 300,
      currentValue: 30000,
      unrealizedPnL: 5000,
      unrealizedPnLPercent: 20,
      currency: 'RUB',
    }

    adapter.addPosition(position)
    const portfolio = await adapter.getPortfolio()
    expect(portfolio.positions).toHaveLength(1)
    expect(portfolio.positions[0]!.ticker).toBe('SBER')
  })

  it('updates existing position by ticker', async () => {
    const pos1: Position = {
      ticker: 'SBER', isin: '', name: 'Сбербанк', instrumentType: 'stock',
      quantity: 100, averagePrice: 250, currentPrice: 300, currentValue: 30000,
      unrealizedPnL: 5000, unrealizedPnLPercent: 20, currency: 'RUB',
    }
    const pos2: Position = {
      ticker: 'SBER', isin: '', name: 'Сбербанк', instrumentType: 'stock',
      quantity: 200, averagePrice: 260, currentPrice: 310, currentValue: 62000,
      unrealizedPnL: 10000, unrealizedPnLPercent: 19.23, currency: 'RUB',
    }

    adapter.addPosition(pos1)
    adapter.addPosition(pos2)

    const portfolio = await adapter.getPortfolio()
    expect(portfolio.positions).toHaveLength(1)
    expect(portfolio.positions[0]!.quantity).toBe(200)
  })

  it('removes a position', async () => {
    const position: Position = {
      ticker: 'SBER', isin: '', name: 'Сбербанк', instrumentType: 'stock',
      quantity: 100, averagePrice: 250, currentPrice: 300, currentValue: 30000,
      unrealizedPnL: 5000, unrealizedPnLPercent: 20, currency: 'RUB',
    }

    adapter.addPosition(position)
    adapter.removePosition('SBER')

    const portfolio = await adapter.getPortfolio()
    expect(portfolio.positions).toHaveLength(0)
  })

  it('calculates total value with positions and cash', async () => {
    const position: Position = {
      ticker: 'SBER', isin: '', name: 'Сбербанк', instrumentType: 'stock',
      quantity: 100, averagePrice: 250, currentPrice: 300, currentValue: 30000,
      unrealizedPnL: 5000, unrealizedPnLPercent: 20, currency: 'RUB',
    }

    adapter.addPosition(position)
    adapter.updateCash([{ currency: 'RUB', amount: 5000 }])

    const portfolio = await adapter.getPortfolio()
    expect(portfolio.totalValue).toBe(35000)
  })

  it('returns empty transactions', async () => {
    const transactions = await adapter.getTransactions()
    expect(transactions).toHaveLength(0)
  })

  it('has correct broker type', () => {
    expect(adapter.brokerType).toBe('manual')
  })
})
