import type { BrokerOptimizationPlan } from '../domain/models'
import { RecommendationCard } from './RecommendationCard'

interface BrokerComparisonPanelProps {
  plan: BrokerOptimizationPlan
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}

export function BrokerComparisonPanel({ plan, onAccept, onDismiss }: BrokerComparisonPanelProps) {
  const { currentDistribution, recommendations, savingsEstimate } = plan

  if (currentDistribution.length === 0) {
    return (
      <div className="broker-panel">
        <h3>Анализ брокеров</h3>
        <p className="no-data">Данные о брокерских счетах недоступны.</p>
      </div>
    )
  }

  return (
    <div className="broker-panel">
      <h3>Анализ брокеров</h3>

      <table className="broker-table">
        <thead>
          <tr>
            <th>Брокер</th>
            <th>Стоимость</th>
            <th>Позиций</th>
            <th>Комиссия</th>
            <th>Подходит для</th>
          </tr>
        </thead>
        <tbody>
          {currentDistribution.map(summary => (
            <tr key={summary.broker}>
              <td><strong>{summary.broker}</strong></td>
              <td>{summary.totalValue.toLocaleString('ru-RU')} ₽</td>
              <td>{summary.positionCount}</td>
              <td>{(summary.avgCommissionRate * 100).toFixed(3)}%</td>
              <td>{summary.suitableFor.join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {savingsEstimate > 0 && (
        <p className="savings-estimate">
          Потенциальная экономия при консолидации:{' '}
          <strong>~{savingsEstimate.toLocaleString('ru-RU')} ₽/год</strong>
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-list">
          <h4>Рекомендации</h4>
          {recommendations.map(rec => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onAccept={onAccept}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}
    </div>
  )
}
