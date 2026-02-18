import type { PortfolioReturn } from '../domain/models'

interface PortfolioSummaryProps {
  data: PortfolioReturn
}

function formatRub(value: number): string {
  return value.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function returnClass(value: number): string {
  if (value > 0) return 'return-positive'
  if (value < 0) return 'return-negative'
  return 'return-neutral'
}

export function PortfolioReturnSummary({ data }: PortfolioSummaryProps) {
  return (
    <div className="portfolio-return-summary">
      <div className="return-card">
        <span className="return-card-value">{formatRub(data.totalCurrentValue)}</span>
        <span className="return-card-label">Текущая стоимость</span>
      </div>
      <div className="return-card">
        <span className={`return-card-value ${returnClass(data.totalAbsoluteReturn)}`}>
          {data.totalAbsoluteReturn > 0 ? '+' : ''}{formatRub(data.totalAbsoluteReturn)}
        </span>
        <span className="return-card-label">
          Доходность ({data.totalRelativeReturn > 0 ? '+' : ''}{data.totalRelativeReturn.toFixed(2)}%)
        </span>
      </div>
      <div className="return-card">
        <span className="return-card-value return-positive">
          +{formatRub(data.totalDividends)}
        </span>
        <span className="return-card-label">Дивиденды и купоны</span>
      </div>
      <div className="return-card">
        <span className="return-card-value return-negative">
          -{formatRub(data.totalCommissions)}
        </span>
        <span className="return-card-label">Комиссии</span>
      </div>
    </div>
  )
}
