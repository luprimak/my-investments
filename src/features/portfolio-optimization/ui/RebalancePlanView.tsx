import type { RebalancePlan } from '../domain/models'
import { RecommendationCard } from './RecommendationCard'

interface RebalancePlanViewProps {
  plan: RebalancePlan
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}

export function RebalancePlanView({ plan, onAccept, onDismiss }: RebalancePlanViewProps) {
  const hasData = plan.beforeSnapshot.categories.length > 0

  return (
    <div className="rebalance-plan">
      <h3>План ребалансировки</h3>

      {!hasData ? (
        <p className="no-data">Настройте целевое распределение для получения плана ребалансировки.</p>
      ) : (
        <>
          <div className="snapshots">
            <div className="snapshot">
              <h4>Текущее распределение</h4>
              <ul>
                {plan.beforeSnapshot.categories.map(c => (
                  <li key={c.category}>{c.category}: <strong>{c.percent}%</strong></li>
                ))}
              </ul>
            </div>
            <div className="snapshot-arrow">→</div>
            <div className="snapshot">
              <h4>Целевое распределение</h4>
              <ul>
                {plan.afterSnapshot.categories.map(c => (
                  <li key={c.category}>{c.category}: <strong>{c.percent}%</strong></li>
                ))}
              </ul>
            </div>
          </div>

          {plan.totalCost > 0 && (
            <p className="total-cost">
              Ориентировочная стоимость ребалансировки:{' '}
              <strong>{plan.totalCost.toLocaleString('ru-RU')} ₽</strong>
            </p>
          )}

          {plan.recommendations.length === 0 ? (
            <p className="no-data">Ребалансировка не требуется — портфель соответствует целевому распределению.</p>
          ) : (
            <div className="recommendations-list">
              {plan.recommendations.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAccept={onAccept}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
