import type { Quote } from '../domain/models'
import { BOARDS } from '../domain/boards'
import { moexGet } from '../api/moex-client'
import { securitiesUrl, securitiesBulkUrl, quoteColumnsParam } from '../api/moex-endpoints'
import { extractBlock, parseBlock, parseFirstRow } from '../api/moex-response-parser'
import { cacheGet, cacheSet } from '../cache/market-data-cache'

interface RawQuoteMarketData {
  ticker: string
  lastPrice: number | null
  openPrice: number | null
  highPrice: number | null
  lowPrice: number | null
  bid: number | null
  ask: number | null
  volume: number | null
  volumeValue: number | null
  change: number | null
  changePercent: number | null
  updatedAt: string | null
  tradingStatus: string | null
}

interface RawQuoteSecurity {
  ticker: string
  previousClose: number | null
  lotSize: number | null
}

const MARKETDATA_MAPPING = {
  ticker: 'SECID',
  lastPrice: 'LAST',
  openPrice: 'OPEN',
  highPrice: 'HIGH',
  lowPrice: 'LOW',
  bid: 'BID',
  ask: 'OFFER',
  volume: 'VOLTODAY',
  volumeValue: 'VALTODAY',
  change: 'CHANGE',
  changePercent: 'LASTTOPREVPRICE',
  updatedAt: 'UPDATETIME',
  tradingStatus: 'TRADINGSTATUS',
}

const SECURITIES_MAPPING = {
  ticker: 'SECID',
  previousClose: 'PREVPRICE',
  lotSize: 'LOTSIZE',
}

function resolveMarketStatus(tradingStatus: string | null): 'open' | 'closed' | 'premarket' {
  if (tradingStatus === 'T' || tradingStatus === 'N') return 'open'
  if (tradingStatus === 'X') return 'premarket'
  return 'closed'
}

function toQuote(md: RawQuoteMarketData, sec: RawQuoteSecurity | null): Quote {
  return {
    ticker: md.ticker,
    lastPrice: md.lastPrice ?? 0,
    previousClose: sec?.previousClose ?? 0,
    openPrice: md.openPrice ?? 0,
    highPrice: md.highPrice ?? 0,
    lowPrice: md.lowPrice ?? 0,
    change: md.change ?? 0,
    changePercent: md.changePercent ?? 0,
    volume: md.volume ?? 0,
    volumeValue: md.volumeValue ?? 0,
    bid: md.bid ?? 0,
    ask: md.ask ?? 0,
    updatedAt: md.updatedAt ?? new Date().toISOString(),
    marketStatus: resolveMarketStatus(md.tradingStatus),
  }
}

export async function getQuote(ticker: string, board = 'TQBR'): Promise<Quote> {
  const cached = cacheGet<Quote>('quote', ticker)
  if (cached) return cached

  const config = BOARDS[board]
  if (!config) throw new Error(`Unknown board: ${board}`)

  const url = `${securitiesUrl(board, config.engine, config.market, ticker)}&${quoteColumnsParam()}`
  const response = await moexGet<Record<string, unknown>>(url)

  const mdBlock = extractBlock(response, 'marketdata')
  const secBlock = extractBlock(response, 'securities')

  if (!mdBlock) throw new Error(`No market data for ${ticker}`)

  const md = parseFirstRow<RawQuoteMarketData>(mdBlock, MARKETDATA_MAPPING)
  const sec = secBlock ? parseFirstRow<RawQuoteSecurity>(secBlock, SECURITIES_MAPPING) : null

  if (!md) throw new Error(`Empty market data for ${ticker}`)

  const quote = toQuote(md, sec)
  cacheSet('quote', ticker, quote)
  return quote
}

export async function getQuotes(tickers: string[], board = 'TQBR'): Promise<Map<string, Quote>> {
  const result = new Map<string, Quote>()
  const uncached: string[] = []

  for (const ticker of tickers) {
    const cached = cacheGet<Quote>('quote', ticker)
    if (cached) {
      result.set(ticker, cached)
    } else {
      uncached.push(ticker)
    }
  }

  if (uncached.length === 0) return result

  const config = BOARDS[board]
  if (!config) throw new Error(`Unknown board: ${board}`)

  const url = `${securitiesBulkUrl(board, config.engine, config.market, uncached)}&${quoteColumnsParam()}`
  const response = await moexGet<Record<string, unknown>>(url)

  const mdBlock = extractBlock(response, 'marketdata')
  const secBlock = extractBlock(response, 'securities')

  if (!mdBlock) return result

  const marketDataRows = parseBlock<RawQuoteMarketData>(mdBlock, MARKETDATA_MAPPING)
  const secRows = secBlock ? parseBlock<RawQuoteSecurity>(secBlock, SECURITIES_MAPPING) : []
  const secMap = new Map(secRows.map(s => [s.ticker, s]))

  for (const md of marketDataRows) {
    if (!md.ticker) continue
    const sec = secMap.get(md.ticker) ?? null
    const quote = toQuote(md, sec)
    cacheSet('quote', md.ticker, quote)
    result.set(md.ticker, quote)
  }

  return result
}
