import type { Recommendation } from '../domain/models'

interface RecommendationCardProps {
  recommendation: Recommendation
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}

const PRIORITY_LABELS: Record<Recommendation['priority'], string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
}

const PRIORITY_COLORS: Record<Recommendation['priority'], string> = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50',
}

const TYPE_LABELS: Record<Recommendation['type'], string> = {
  close_position: 'Закрытие позиции',
  rebalance_trade: 'Ребалансировка',
  transfer: 'Перенос',
  close_account: 'Закрытие счёта',
}

export function RecommendationCard({ recommendation, onAccept, onDismiss }: RecommendationCardProps) {
  const { id, type, priority, title, reason, impact, actions, status } = recommendation

  return (
    <div className={`recommendation-card recommendation-${status}`}>
      <div className="recommendation-header">
        <span className="recommendation-type">{TYPE_LABELS[type]}</span>
        <span
          className="priority-badge"
          style={{ backgroundColor: PRIORITY_COLORS[priority] }}
        >
          {PRIORITY_LABELS[priority]}
        </span>
      </div>

      <h4 className="recommendation-title">{title}</h4>
      <p className="recommendation-reason">{reason}</p>

      <div className="recommendation-impact">
        <p className="improvement">{impact.portfolioImprovement}</p>
        {impact.totalCost > 0 && (
          <div className="cost-details">
            <span>Комиссия: {impact.estimatedCommission.toLocaleString('ru-RU')} ₽</span>
            {impact.estimatedTax > 0 && (
              <span> | Налог: {impact.estimatedTax.toLocaleString('ru-RU')} ₽</span>
            )}
            <span> | Итого: {impact.totalCost.toLocaleString('ru-RU')} ₽</span>
          </div>
        )}
      </div>

      {actions.length > 0 && (
        <div className="recommendation-actions-list">
          <h5>Действия:</h5>
          <ul>
            {actions.map((action, i) => (
              <li key={i}>
                {action.direction === 'buy' ? 'Купить' : 'Продать'}{' '}
                {action.ticker} ({action.broker})
                {action.estimatedAmount > 0 && (
                  <> — {action.estimatedAmount.toLocaleString('ru-RU')} ₽</>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'pending' && (
        <div className="recommendation-buttons">
          <button className="btn btn-primary btn-sm" onClick={() => onAccept(id)}>
            Принять
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onDismiss(id)}>
            Отклонить
          </button>
        </div>
      )}

      {status === 'accepted' && (
        <div className="recommendation-status-badge accepted">Принято</div>
      )}
      {status === 'dismissed' && (
        <div className="recommendation-status-badge dismissed">Отклонено</div>
      )}
    </div>
  )
}
