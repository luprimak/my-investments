import type { DiversificationRecommendation, DiversificationDimension } from '../domain/models'

interface RecommendationsListProps {
  recommendations: DiversificationRecommendation[]
}

const PRIORITY_ICONS: Record<DiversificationRecommendation['priority'], string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
}

const DIMENSION_LABELS: Record<DiversificationDimension, string> = {
  asset_class: 'Классы активов',
  sector: 'Секторы',
  issuer: 'Эмитенты',
  geography: 'География',
  currency: 'Валюты',
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="recommendations-panel">
        <h3>Рекомендации</h3>
        <p className="no-data">Портфель хорошо диверсифицирован. Рекомендаций нет.</p>
      </div>
    )
  }

  return (
    <div className="recommendations-panel">
      <h3>Рекомендации по диверсификации</h3>
      <p className="disclaimer">
        Данные рекомендации носят информационный характер и не являются индивидуальной инвестиционной рекомендацией.
      </p>
      <div className="recommendations-cards">
        {recommendations.map(rec => (
          <div key={rec.id} className="div-rec-card">
            <div className="div-rec-header">
              <span>{PRIORITY_ICONS[rec.priority]}</span>
              <span className="div-rec-dimension">{DIMENSION_LABELS[rec.affectedDimension]}</span>
            </div>
            <h4>{rec.title}</h4>
            <p className="div-rec-description">{rec.description}</p>
            {rec.suggestedActions.length > 0 && (
              <ul className="suggested-actions">
                {rec.suggestedActions.map((action, i) => (
                  <li key={i} className={`action-${action.action}`}>
                    <strong>{actionLabel(action.action)}:</strong>{' '}
                    {action.name} — {action.reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function actionLabel(action: string): string {
  switch (action) {
    case 'buy': return 'Купить'
    case 'sell': return 'Продать'
    case 'consider': return 'Рассмотреть'
    default: return action
  }
}
