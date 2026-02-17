import type { DimensionAnalysis, DiversificationDimension } from '../domain/models'
import { classifyHHI } from '../services/hhi-calculator'

interface DimensionBreakdownProps {
  analysis: DimensionAnalysis
}

const DIMENSION_LABELS: Record<DiversificationDimension, string> = {
  asset_class: 'Классы активов',
  sector: 'Секторы',
  issuer: 'Эмитенты',
  geography: 'География',
  currency: 'Валюты',
}

const HHI_LABELS: Record<string, string> = {
  low: 'Хорошая диверсификация',
  moderate: 'Умеренная концентрация',
  high: 'Высокая концентрация',
}

export function DimensionBreakdown({ analysis }: DimensionBreakdownProps) {
  const hhiClass = classifyHHI(analysis.concentrationIndex)

  return (
    <div className="dimension-breakdown">
      <div className="dimension-header">
        <h4>{DIMENSION_LABELS[analysis.dimension]}</h4>
        <span className={`dimension-score score-${scoreClass(analysis.score)}`}>
          {analysis.score}/100
        </span>
      </div>

      <div className="dimension-hhi">
        HHI: {(analysis.concentrationIndex * 10000).toFixed(0)} — {HHI_LABELS[hhiClass]}
      </div>

      <div className="distribution-bars">
        {analysis.distribution.map(cat => (
          <div key={cat.category} className="distribution-item">
            <div className="dist-label">
              <span className="dist-name">{cat.category}</span>
              <span className="dist-percent">{cat.currentPercent}%</span>
            </div>
            <div className="dist-bar-bg">
              <div
                className="dist-bar-fill"
                style={{ width: `${Math.min(cat.currentPercent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {analysis.warnings.length > 0 && (
        <div className="dimension-warnings">
          {analysis.warnings.map((w, i) => (
            <div key={i} className={`warning-item warning-${w.severity}`}>
              {w.severity === 'critical' ? '🔴' : w.severity === 'warning' ? '🟡' : 'ℹ️'}{' '}
              {w.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function scoreClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}
