import { describe, it, expect } from 'vitest'
import {
  securitiesUrl,
  securitiesBulkUrl,
  historyUrl,
  securityInfoUrl,
  securitySearchUrl,
  indexUrl,
  exchangeRateUrl,
} from '../moex-endpoints'

describe('moex-endpoints', () => {
  it('builds single security URL', () => {
    const url = securitiesUrl('TQBR', 'stock', 'shares', 'SBER')
    expect(url).toBe('https://iss.moex.com/iss/engines/stock/markets/shares/boards/TQBR/securities/SBER.json')
  })

  it('builds bulk securities URL', () => {
    const url = securitiesBulkUrl('TQBR', 'stock', 'shares', ['SBER', 'GAZP', 'LKOH'])
    expect(url).toContain('securities.json?securities=SBER,GAZP,LKOH')
  })

  it('builds history URL with date range', () => {
    const url = historyUrl('TQBR', 'stock', 'shares', 'SBER', '2025-01-01', '2025-12-31')
    expect(url).toContain('/history/')
    expect(url).toContain('SBER.json')
    expect(url).toContain('from=2025-01-01')
    expect(url).toContain('till=2025-12-31')
  })

  it('builds security info URL', () => {
    const url = securityInfoUrl('SBER')
    expect(url).toBe('https://iss.moex.com/iss/securities/SBER.json')
  })

  it('builds search URL with encoded query', () => {
    const url = securitySearchUrl('Сбербанк')
    expect(url).toContain('securities.json?q=')
    expect(url).toContain('limit=20')
  })

  it('builds index analytics URL', () => {
    const url = indexUrl('IMOEX')
    expect(url).toContain('/statistics/')
    expect(url).toContain('IMOEX.json')
  })

  it('builds exchange rate URL', () => {
    const url = exchangeRateUrl()
    expect(url).toContain('/currency/markets/selt/boards/CETS/')
  })
})
