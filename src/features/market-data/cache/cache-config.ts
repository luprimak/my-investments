export interface CacheTierConfig {
  ttlMs: number
  maxEntries: number
}

export const CACHE_CONFIG: Record<string, CacheTierConfig> = {
  'security:meta': { ttlMs: 86_400_000, maxEntries: 500 },
  'quote': { ttlMs: 60_000, maxEntries: 200 },
  'bond': { ttlMs: 3_600_000, maxEntries: 100 },
  'history': { ttlMs: 86_400_000, maxEntries: 50 },
  'exchange_rate': { ttlMs: 300_000, maxEntries: 10 },
  'index': { ttlMs: 86_400_000, maxEntries: 10 },
  'dividend': { ttlMs: 21_600_000, maxEntries: 100 },
  'coupon': { ttlMs: 21_600_000, maxEntries: 100 },
}
