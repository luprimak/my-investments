import type { BrokerType, BrokerConnection } from '../domain/models'
import type { IBrokerAdapter } from '../adapters/broker-adapter'
import { TBankAdapter } from '../adapters/tbank-adapter'
import { AlfaAdapter } from '../adapters/alfa-adapter'
import { SberbankAdapter } from '../adapters/sberbank-adapter'
import { VtbAdapter } from '../adapters/vtb-adapter'
import { ManualAdapter } from '../adapters/manual-adapter'

const CONNECTIONS_KEY = 'broker:connections'

const adapters = new Map<string, IBrokerAdapter>()

function createAdapter(brokerId: string, broker: BrokerType): IBrokerAdapter {
  switch (broker) {
    case 'tbank': return new TBankAdapter(brokerId)
    case 'alfa': return new AlfaAdapter(brokerId)
    case 'sberbank': return new SberbankAdapter(brokerId)
    case 'vtb': return new VtbAdapter(brokerId)
    case 'manual': return new ManualAdapter(brokerId)
  }
}

function generateId(): string {
  return `broker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getAdapter(brokerId: string): IBrokerAdapter | null {
  return adapters.get(brokerId) ?? null
}

export function getConnections(): BrokerConnection[] {
  try {
    const data = localStorage.getItem(CONNECTIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveConnections(connections: BrokerConnection[]): void {
  try {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections))
  } catch {
    // localStorage unavailable
  }
}

export function addConnection(
  broker: BrokerType,
  displayName: string,
  connectionType: 'api' | 'manual' | 'import',
): BrokerConnection {
  const id = generateId()
  const connection: BrokerConnection = {
    id,
    broker,
    displayName,
    connectionType,
    status: 'active',
    lastSyncAt: null,
    lastSyncStatus: null,
    createdAt: new Date().toISOString(),
  }

  const adapter = createAdapter(id, broker)
  adapters.set(id, adapter)

  const connections = getConnections()
  connections.push(connection)
  saveConnections(connections)

  return connection
}

export function removeConnection(brokerId: string): void {
  adapters.delete(brokerId)
  const connections = getConnections().filter(c => c.id !== brokerId)
  saveConnections(connections)
}

export function updateConnectionStatus(
  brokerId: string,
  status: BrokerConnection['status'],
  syncStatus?: BrokerConnection['lastSyncStatus'],
): void {
  const connections = getConnections()
  const conn = connections.find(c => c.id === brokerId)
  if (conn) {
    conn.status = status
    if (syncStatus !== undefined) {
      conn.lastSyncStatus = syncStatus
      conn.lastSyncAt = new Date().toISOString()
    }
    saveConnections(connections)
  }
}

export function initializeAdapters(): void {
  const connections = getConnections()
  for (const conn of connections) {
    if (!adapters.has(conn.id)) {
      adapters.set(conn.id, createAdapter(conn.id, conn.broker))
    }
  }
}

export function resetRegistry(): void {
  adapters.clear()
}
