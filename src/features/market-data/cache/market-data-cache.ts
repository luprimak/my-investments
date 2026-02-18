import { CACHE_CONFIG } from './cache-config'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const stores = new Map<string, Map<string, CacheEntry<unknown>>>()

function getStore(tier: string): Map<string, CacheEntry<unknown>> {
  let store = stores.get(tier)
  if (!store) {
    store = new Map()
    stores.set(tier, store)
  }
  return store
}

export function cacheGet<T>(tier: string, key: string): T | null {
  const store = getStore(tier)
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value as T
}

export function cacheSet<T>(tier: string, key: string, value: T): void {
  const config = CACHE_CONFIG[tier]
  if (!config) return

  const store = getStore(tier)

  if (store.size >= config.maxEntries) {
    const oldestKey = store.keys().next().value
    if (oldestKey !== undefined) {
      store.delete(oldestKey)
    }
  }

  store.set(key, {
    value,
    expiresAt: Date.now() + config.ttlMs,
  })
}

export function cacheInvalidate(tier: string, key?: string): void {
  if (key) {
    getStore(tier).delete(key)
  } else {
    stores.delete(tier)
  }
}

export function cacheReset(): void {
  stores.clear()
}
