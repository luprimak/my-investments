import type { BrokerConnection } from '../domain/models'
import { BROKER_META } from '../domain/broker-types'

interface BrokerConnectionListProps {
  connections: BrokerConnection[]
}

const TYPE_LABELS: Record<string, string> = {
  api: 'API',
  manual: 'Ручной',
  import: 'Импорт',
}

const SYNC_STATUS_LABELS: Record<string, string> = {
  success: 'Успешно',
  partial: 'Частично',
  failed: 'Ошибка',
}

function formatSyncTime(isoDate: string | null): string {
  if (!isoDate) return 'Никогда'
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Только что'
  if (diffMin < 60) return `${diffMin} мин назад`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} ч назад`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} дн назад`
}

export function BrokerConnectionList({ connections }: BrokerConnectionListProps) {
  return (
    <div className="connections-section">
      <h3>Подключённые брокеры</h3>
      <div className="connection-list">
        {connections.map(conn => {
          const meta = BROKER_META[conn.broker]
          return (
            <div key={conn.id} className="connection-card">
              <div className={`connection-badge ${conn.status}`} />
              <div style={{ width: 4, height: 24, borderRadius: 2, background: meta.color, flexShrink: 0 }} />
              <div className="connection-info">
                <div className="connection-name">{conn.displayName}</div>
                <div className="connection-meta">
                  <span>{meta.shortName}</span>
                  <span className="connection-type-badge">{TYPE_LABELS[conn.connectionType] ?? conn.connectionType}</span>
                </div>
              </div>
              <div className="connection-sync">
                <div>{formatSyncTime(conn.lastSyncAt)}</div>
                {conn.lastSyncStatus && (
                  <span className={`sync-status ${conn.lastSyncStatus}`}>
                    {SYNC_STATUS_LABELS[conn.lastSyncStatus]}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
