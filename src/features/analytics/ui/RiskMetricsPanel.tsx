import type { RiskMetrics } from '../domain/models'

interface RiskMetricsPanelProps {
  metrics: RiskMetrics
}

export function RiskMetricsPanel({ metrics }: RiskMetricsPanelProps) {
  const formatDate = (d: string) => {
    if (!d) return '—'
    const parts = d.split('-')
    return `${parts[2]}.${parts[1]}.${parts[0]}`
  }

  return (
    <div className="risk-metrics-panel">
      <h4 className="risk-metrics-title">Метрики риска</h4>
      <div className="risk-cards">
        <div className="risk-card">
          <div className="risk-card-label">Волатильность</div>
          <div className="risk-card-value">{metrics.volatility.toFixed(2)}%</div>
          <div className="risk-card-desc">Годовая стандартное отклонение</div>
        </div>
        <div className="risk-card">
          <div className="risk-card-label">Коэфф. Шарпа</div>
          <div className={`risk-card-value ${metrics.sharpeRatio >= 1 ? 'positive' : metrics.sharpeRatio < 0 ? 'negative' : ''}`}>
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="risk-card-desc">
            {metrics.sharpeRatio >= 1 ? 'Хорошо' : metrics.sharpeRatio >= 0 ? 'Удовлетворительно' : 'Плохо'}
          </div>
        </div>
        <div className="risk-card">
          <div className="risk-card-label">Макс. просадка</div>
          <div className="risk-card-value negative">{metrics.maxDrawdown.toFixed(2)}%</div>
          <div className="risk-card-desc">
            {metrics.maxDrawdownPeriod.peakDate && metrics.maxDrawdownPeriod.troughDate
              ? `${formatDate(metrics.maxDrawdownPeriod.peakDate)} — ${formatDate(metrics.maxDrawdownPeriod.troughDate)}`
              : '—'}
          </div>
        </div>
        {metrics.beta !== undefined && (
          <div className="risk-card">
            <div className="risk-card-label">Бета</div>
            <div className="risk-card-value">{metrics.beta.toFixed(2)}</div>
            <div className="risk-card-desc">Относительно IMOEX</div>
          </div>
        )}
      </div>
    </div>
  )
}
