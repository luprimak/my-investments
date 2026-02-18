import type { WeightEntry } from '../domain/models'
import { formatWeight, formatDate, changeClass } from '../domain/formatters'
import { exportToCsv } from '../services/storage-service'

interface WeightHistoryProps {
  entries: WeightEntry[]
  onDelete: (id: string) => void
}

export function WeightHistory({ entries, onDelete }: WeightHistoryProps) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  function handleExport() {
    const allSorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    const csv = exportToCsv(allSorted)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weight-tracker-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="history-section">
      <div className="history-header">
        <h3>История ({entries.length})</h3>
        <div className="actions-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            disabled={entries.length === 0}
          >
            Экспорт CSV
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="no-data">Нет записей. Добавьте первую запись выше.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th className="col-right">Вес</th>
              <th className="col-right">Изменение</th>
              <th>Заметка</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry, idx) => {
              const prev = idx < sorted.length - 1 ? sorted[idx + 1] : null
              const change = prev ? entry.weight - prev.weight : 0

              return (
                <tr key={entry.id}>
                  <td>{formatDate(entry.date)}</td>
                  <td className="col-right">{formatWeight(entry.weight)}</td>
                  <td className={`col-right ${changeClass(change)}`}>
                    {prev ? `${change > 0 ? '+' : ''}${change.toFixed(1)}` : '—'}
                  </td>
                  <td>{entry.note ?? ''}</td>
                  <td className="col-right">
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(entry.id)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
