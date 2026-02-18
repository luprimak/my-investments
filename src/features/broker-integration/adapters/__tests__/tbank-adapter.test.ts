import { describe, it, expect } from 'vitest'
import { TBankAdapter } from '../tbank-adapter'

describe('TBankAdapter', () => {
  it('has correct broker type', () => {
    const adapter = new TBankAdapter('test-tbank-1')
    expect(adapter.brokerType).toBe('tbank')
  })

  it('supports real-time sync', () => {
    const adapter = new TBankAdapter('test-tbank-1')
    expect(adapter.capabilities.supportsRealTimeSync).toBe(true)
    expect(adapter.capabilities.supportsTransactionHistory).toBe(true)
    expect(adapter.capabilities.maxRequestsPerMinute).toBe(120)
  })

  it('rejects connection without token', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    const result = await adapter.connect({})
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('accepts connection with token', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    const result = await adapter.connect({ token: 'test-token-123' })
    expect(result.success).toBe(true)
    expect(result.brokerId).toBe('test-tbank-1')
  })

  it('validates connection after connect', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    expect(await adapter.validateConnection()).toBe(false)

    await adapter.connect({ token: 'test-token-123' })
    expect(await adapter.validateConnection()).toBe(true)
  })

  it('invalidates connection after disconnect', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    await adapter.connect({ token: 'test-token-123' })
    await adapter.disconnect()
    expect(await adapter.validateConnection()).toBe(false)
  })

  it('throws error when getting portfolio without connection', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    await expect(adapter.getPortfolio()).rejects.toThrow('Не подключено')
  })

  it('returns portfolio structure when connected', async () => {
    const adapter = new TBankAdapter('test-tbank-1')
    await adapter.connect({ token: 'test-token-123' })

    const portfolio = await adapter.getPortfolio()
    expect(portfolio.broker).toBe('tbank')
    expect(portfolio.brokerId).toBe('test-tbank-1')
    expect(portfolio.positions).toBeDefined()
    expect(portfolio.cash).toBeDefined()
  })
})
