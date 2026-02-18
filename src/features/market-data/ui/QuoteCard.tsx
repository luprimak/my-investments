import type { Quote } from '../domain/models'

interface QuoteCardProps {
  quote: Quote
  name: string
  selected: boolean
  onClick: () => void
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
  if (price >= 1) return price.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toLocaleString('ru-RU', { minimumFractionDigits: 4, maximumFractionDigits: 5 })
}

function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} млрд ₽`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн ₽`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} тыс ₽`
  return `${value.toFixed(0)} ₽`
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Торги',
  closed: 'Закрыто',
  premarket: 'Премаркет',
}

export function QuoteCard({ quote, name, selected, onClick }: QuoteCardProps) {
  const changeClass = quote.change > 0 ? 'positive' : quote.change < 0 ? 'negative' : 'neutral'
  const sign = quote.change > 0 ? '+' : ''

  return (
    <div className={`quote-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="quote-header">
        <div>
          <div className="quote-ticker">{quote.ticker}</div>
          <div className="quote-name">{name}</div>
        </div>
        <span className={`quote-status ${quote.marketStatus}`}>
          {STATUS_LABELS[quote.marketStatus] ?? quote.marketStatus}
        </span>
      </div>

      <div className="quote-price">{formatPrice(quote.lastPrice)} ₽</div>

      <div className={`quote-change ${changeClass}`}>
        {sign}{formatPrice(quote.change)} ({sign}{quote.changePercent.toFixed(2)}%)
      </div>

      <div className="quote-volume">
        Оборот: {formatVolume(quote.volumeValue)}
      </div>

      <div className="quote-bid-ask">
        <span>Bid: {formatPrice(quote.bid)}</span>
        <span>Ask: {formatPrice(quote.ask)}</span>
      </div>
    </div>
  )
}
