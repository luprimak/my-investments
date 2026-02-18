import type { ExchangeRate } from '../domain/models'
import { moexGet } from '../api/moex-client'
import { exchangeRateUrl } from '../api/moex-endpoints'
import { extractBlock, parseBlock } from '../api/moex-response-parser'
import { cacheGet, cacheSet } from '../cache/market-data-cache'

interface RawRate {
  ticker: string
  lastPrice: number | null
  updatedAt: string | null
}

const RATE_MAPPING = {
  ticker: 'SECID',
  lastPrice: 'LAST',
  updatedAt: 'UPDATETIME',
}

const PAIR_TO_TICKER: Record<string, string> = {
  'USD/RUB': 'USD000UTSTOM',
  'EUR/RUB': 'EUR_RUB__TOM',
  'CNY/RUB': 'CNYRUB_TOM',
}

export async function getExchangeRate(pair: string): Promise<ExchangeRate> {
  const cached = cacheGet<ExchangeRate>('exchange_rate', pair)
  if (cached) return cached

  const moexTicker = PAIR_TO_TICKER[pair]
  if (!moexTicker) throw new Error(`Unknown currency pair: ${pair}`)

  const url = `${exchangeRateUrl()}&iss.only=marketdata&marketdata.columns=SECID,LAST,UPDATETIME`
  const response = await moexGet<Record<string, unknown>>(url)

  const block = extractBlock(response, 'marketdata')
  if (!block) throw new Error(`No exchange rate data`)

  const rows = parseBlock<RawRate>(block, RATE_MAPPING)
  const row = rows.find(r => r.ticker === moexTicker)
  if (!row || row.lastPrice === null) throw new Error(`No rate for ${pair}`)

  const rate: ExchangeRate = {
    pair,
    rate: row.lastPrice,
    updatedAt: row.updatedAt ?? new Date().toISOString(),
  }

  cacheSet('exchange_rate', pair, rate)
  return rate
}

export async function getExchangeRates(): Promise<Map<string, ExchangeRate>> {
  const result = new Map<string, ExchangeRate>()

  for (const pair of Object.keys(PAIR_TO_TICKER)) {
    try {
      const rate = await getExchangeRate(pair)
      result.set(pair, rate)
    } catch {
      // Skip unavailable rates
    }
  }

  return result
}
