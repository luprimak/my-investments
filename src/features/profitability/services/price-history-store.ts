import type { PricePoint } from '../domain/models'

let store: PricePoint[] = []

export function addPricePoints(points: PricePoint[]): void {
  store.push(...points)
}

export function getPriceHistory(ticker: string): PricePoint[] {
  return store
    .filter(p => p.ticker === ticker)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getLatestPrice(ticker: string): number | null {
  const history = getPriceHistory(ticker)
  if (history.length === 0) return null
  return history[history.length - 1]!.price
}

export function getAllPriceHistory(): PricePoint[] {
  return [...store]
}

export function clearHistory(): void {
  store = []
}
