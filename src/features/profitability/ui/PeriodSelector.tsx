import type { ReturnPeriod } from '../domain/models'
import { AVAILABLE_PERIODS, PERIOD_LABELS } from '../domain/constants'

interface PeriodSelectorProps {
  activePeriod: ReturnPeriod
  onPeriodChange: (period: ReturnPeriod) => void
}

export function PeriodSelector({ activePeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="period-selector">
      {AVAILABLE_PERIODS.map(period => (
        <button
          key={period}
          className={`period-btn ${activePeriod === period ? 'active' : ''}`}
          onClick={() => onPeriodChange(period)}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  )
}
