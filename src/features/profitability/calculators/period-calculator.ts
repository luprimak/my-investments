import type { ReturnPeriod, PricePoint } from '../domain/models'
import { PERIOD_DAYS } from '../domain/constants'

export function getStartDate(period: ReturnPeriod): Date | null {
  const days = PERIOD_DAYS[period]
  if (days === null) return null
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d
}

export function getStartDateISO(period: ReturnPeriod): string | null {
  const d = getStartDate(period)
  return d ? d.toISOString().split('T')[0]! : null
}

export function filterByPeriod<T extends { date: string }>(
  records: T[],
  period: ReturnPeriod,
): T[] {
  const cutoff = getStartDateISO(period)
  if (!cutoff) return records
  return records.filter(r => r.date >= cutoff)
}

export function getClosestPrice(
  priceHistory: PricePoint[],
  ticker: string,
  targetDate: string,
): number | null {
  const tickerPrices = priceHistory
    .filter(p => p.ticker === ticker)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (tickerPrices.length === 0) return null

  let closest = tickerPrices[0]!
  let minDiff = Math.abs(new Date(closest.date).getTime() - new Date(targetDate).getTime())

  for (const p of tickerPrices) {
    const diff = Math.abs(new Date(p.date).getTime() - new Date(targetDate).getTime())
    if (diff < minDiff) {
      minDiff = diff
      closest = p
    }
  }

  return closest.price
}

export function getValueAtPeriodStart(
  ticker: string,
  period: ReturnPeriod,
  priceHistory: PricePoint[],
  quantity: number,
): number | null {
  const startDate = getStartDateISO(period)
  if (!startDate) return null
  const price = getClosestPrice(priceHistory, ticker, startDate)
  if (price === null) return null
  return price * quantity
}
