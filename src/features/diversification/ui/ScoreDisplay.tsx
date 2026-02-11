import type { OverallRating } from '../domain/models'

interface ScoreDisplayProps {
  score: number
  rating: OverallRating
}

const RATING_LABELS: Record<OverallRating, string> = {
  poor: 'Слабая',
  fair: 'Удовлетворительная',
  good: 'Хорошая',
  excellent: 'Отличная',
}

const RATING_COLORS: Record<OverallRating, string> = {
  poor: '#f44336',
  fair: '#ff9800',
  good: '#4caf50',
  excellent: '#2196f3',
}

export function ScoreDisplay({ score, rating }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      <div
        className="score-circle"
        style={{ borderColor: RATING_COLORS[rating] }}
      >
        <span className="score-value" style={{ color: RATING_COLORS[rating] }}>
          {score}
        </span>
        <span className="score-max">/100</span>
      </div>
      <div className="score-label" style={{ color: RATING_COLORS[rating] }}>
        {RATING_LABELS[rating]} диверсификация
      </div>
    </div>
  )
}
