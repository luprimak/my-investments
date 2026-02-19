import type { Portfolio, SyncResult } from '../domain/models'
import { getConnections, getAdapter, updateConnectionStatus } from './broker-registry'

const portfolioCache = new Map<string, Portfolio>()

export async function syncBroker(brokerId: string): Promise<SyncResult> {
  const adapter = getAdapter(brokerId)
  if (!adapter) {
    return {
      brokerId,
      broker: 'manual',
      status: 'failed',
      error: 'Адаптер не найден',
      syncedAt: new Date().toISOString(),
    }
  }

  try {
    const portfolio = await adapter.getPortfolio()
    portfolioCache.set(brokerId, portfolio)
    updateConnectionStatus(brokerId, 'active', 'success')

    return {
      brokerId,
      broker: adapter.brokerType,
      status: 'success',
      syncedAt: portfolio.syncedAt,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
    updateConnectionStatus(brokerId, 'error', 'failed')

    return {
      brokerId,
      broker: adapter.brokerType,
      status: 'failed',
      error: message,
      syncedAt: new Date().toISOString(),
    }
  }
}

export async function syncAll(): Promise<SyncResult[]> {
  const connections = getConnections()
  const results = await Promise.allSettled(
    connections.map(conn => syncBroker(conn.id))
  )

  return results.map(result => {
    if (result.status === 'fulfilled') return result.value
    return {
      brokerId: 'unknown',
      broker: 'manual' as const,
      status: 'failed' as const,
      error: 'Ошибка синхронизации',
      syncedAt: new Date().toISOString(),
    }
  })
}

export function getCachedPortfolio(brokerId: string): Portfolio | null {
  return portfolioCache.get(brokerId) ?? null
}

export function getAllCachedPortfolios(): Portfolio[] {
  return Array.from(portfolioCache.values())
}

export function clearCache(): void {
  portfolioCache.clear()
}
