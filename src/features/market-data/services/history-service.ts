import type { Candle } from '../domain/models'
import { BOARDS } from '../domain/boards'
import { moexGet } from '../api/moex-client'
import { historyUrl } from '../api/moex-endpoints'
import { extractBlock, parseBlock } from '../api/moex-response-parser'
import { cacheGet, cacheSet } from '../cache/market-data-cache'

interface RawCandle {
  date: string | null
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
  value: number | null
}

const CANDLE_MAPPING = {
  date: 'TRADEDATE',
  open: 'OPEN',
  high: 'HIGH',
  low: 'LOW',
  close: 'CLOSE',
  volume: 'VOLUME',
  value: 'VALUE',
}

function toCandle(raw: RawCandle): Candle | null {
  if (!raw.date || raw.close === null) return null
  return {
    date: raw.date,
    open: raw.open ?? raw.close,
    high: raw.high ?? raw.close,
    low: raw.low ?? raw.close,
    close: raw.close,
    volume: raw.volume ?? 0,
    value: raw.value ?? 0,
  }
}

export async function getHistory(
  ticker: string,
  from: string,
  to: string,
  board = 'TQBR',
): Promise<Candle[]> {
  const cacheKey = `${ticker}:${from}:${to}`
  const cached = cacheGet<Candle[]>('history', cacheKey)
  if (cached) return cached

  const config = BOARDS[board]
  if (!config) throw new Error(`Unknown board: ${board}`)

  const allCandles: Candle[] = []
  let cursor = from

  while (true) {
    const url = historyUrl(board, config.engine, config.market, ticker, cursor, to)
    const response = await moexGet<Record<string, unknown>>(url)

    const block = extractBlock(response, 'history')
    if (!block || block.data.length === 0) break

    const rawCandles = parseBlock<RawCandle>(block, CANDLE_MAPPING)
    const candles = rawCandles.map(toCandle).filter((c): c is Candle => c !== null)

    if (candles.length === 0) break
    allCandles.push(...candles)

    const lastDate = candles[candles.length - 1]!.date
    if (lastDate >= to || candles.length < 100) break
    cursor = lastDate
  }

  cacheSet('history', cacheKey, allCandles)
  return allCandles
}

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10)
}
