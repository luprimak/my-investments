import type { AnalysisPeriod } from '../domain/models'
import { ANALYSIS_PERIODS } from '../domain/constants'

interface PeriodSelectorProps {
  selected: AnalysisPeriod
  onChange: (period: AnalysisPeriod) => void
}

const PERIODS: AnalysisPeriod[] = ['1M', '3M', '6M', '1Y', 'YTD', 'ALL']

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="period-selector">
      {PERIODS.map(p => (
        <button
          key={p}
          className={`period-btn ${selected === p ? 'active' : ''}`}
          onClick={() => onChange(p)}
        >
          {ANALYSIS_PERIODS[p].label}
        </button>
      ))}
    </div>
  )
}
