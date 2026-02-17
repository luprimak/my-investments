import type { PortfolioMetrics } from '../domain/models'
import { formatRub, formatPercent, gainClass } from '../domain/formatters'

interface PortfolioSummaryProps {
  metrics: PortfolioMetrics
}

export function PortfolioSummary({ metrics }: PortfolioSummaryProps) {
  return (
    <div className="portfolio-summary">
      <div className="summary-card">
        <span className="summary-card-value">{formatRub(metrics.totalValue)}</span>
        <span className="summary-card-label">Общая стоимость</span>
      </div>
      <div className="summary-card">
        <span className={`summary-card-value ${gainClass(metrics.totalGain)}`}>
          {formatRub(metrics.totalGain)}
        </span>
        <span className="summary-card-label">
          Прибыль/Убыток ({formatPercent(metrics.totalGainPercent)})
        </span>
      </div>
      <div className="summary-card">
        <span className="summary-card-value">{metrics.positionCount}</span>
        <span className="summary-card-label">Позиций</span>
      </div>
      <div className="summary-card">
        <span className="summary-card-value">{metrics.brokerCount}</span>
        <span className="summary-card-label">Брокеров</span>
      </div>
    </div>
  )
}
