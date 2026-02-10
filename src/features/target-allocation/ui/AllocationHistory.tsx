import type { AllocationHistoryEntry } from '../domain/models'

interface AllocationHistoryProps {
  entries: AllocationHistoryEntry[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function AllocationHistory({ entries }: AllocationHistoryProps) {
  if (entries.length === 0) {
    return (
      <div className="allocation-history">
        <h3>История изменений</h3>
        <p className="no-data">Изменений пока не было.</p>
      </div>
    )
  }

  return (
    <div className="allocation-history">
      <h3>История изменений</h3>
      <ul className="history-list">
        {entries.map(entry => (
          <li key={entry.id} className="history-entry">
            <div className="history-date">{formatDate(entry.changedAt)}</div>
            <div className="history-detail">
              <strong>{entry.previousSnapshot.name}</strong>
              {entry.reason && <span className="history-reason"> — {entry.reason}</span>}
              <ul className="history-rules">
                {entry.previousSnapshot.rules.map(r => (
                  <li key={r.id}>{r.category}: {r.targetPercent}%</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
