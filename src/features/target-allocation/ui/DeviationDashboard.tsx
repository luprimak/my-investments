import type { Deviation } from '../domain/models'
import { needsRebalancing, rebalancingRecommended } from '../services/deviation-service'

interface DeviationDashboardProps {
  deviations: Deviation[]
}

const SEVERITY_ICONS: Record<Deviation['severity'], string> = {
  ok: '🟢',
  warning: '🟡',
  critical: '🔴',
}

export function DeviationDashboard({ deviations }: DeviationDashboardProps) {
  const needsRebal = needsRebalancing(deviations)
  const recommended = rebalancingRecommended(deviations)

  return (
    <div className="deviation-dashboard">
      <h3>Отклонения от целевого распределения</h3>

      {deviations.length === 0 ? (
        <p className="no-data">Нет данных для анализа. Настройте целевое распределение и подключите портфель.</p>
      ) : (
        <>
          <table className="deviation-table">
            <thead>
              <tr>
                <th>Категория</th>
                <th>Целевое</th>
                <th>Текущее</th>
                <th>Отклонение</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {deviations.map(d => (
                <tr key={`${d.dimension}-${d.category}`}>
                  <td>{d.category}</td>
                  <td>{d.targetPercent}%</td>
                  <td>{d.currentPercent}%</td>
                  <td className={d.deviationPercent > 0 ? 'positive' : d.deviationPercent < 0 ? 'negative' : ''}>
                    {d.deviationPercent > 0 ? '+' : ''}{d.deviationPercent}%
                  </td>
                  <td>{SEVERITY_ICONS[d.severity]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="rebalancing-status" role="status">
            {needsRebal ? (
              <p className="status-critical">🔴 Требуется ребалансировка</p>
            ) : recommended ? (
              <p className="status-warning">🟡 Рекомендуется ребалансировка</p>
            ) : (
              <p className="status-ok">🟢 Портфель сбалансирован</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
