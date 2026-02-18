import { useState } from 'react'
import type { Security } from '../domain/models'
import { DEMO_SECURITIES, DEMO_QUOTES, DEMO_BOND, DEMO_EXCHANGE_RATES } from '../services/demo-data'
import { SecuritySearch } from './SecuritySearch'
import { QuoteCard } from './QuoteCard'
import { PriceChart } from './PriceChart'
import { BondDetails } from './BondDetails'
import './MarketDataPage.css'

export function MarketDataPage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const quotesMap = new Map(DEMO_QUOTES.map(q => [q.ticker, q]))
  const securitiesMap = new Map(DEMO_SECURITIES.map(s => [s.ticker, s]))

  const selectedSecurity = selectedTicker ? securitiesMap.get(selectedTicker) : null
  const isBond = selectedSecurity?.type === 'bond_ofz' || selectedSecurity?.type === 'bond_corp' || selectedSecurity?.type === 'bond_muni'

  function handleSelectSecurity(sec: Security) {
    setSelectedTicker(sec.ticker)
  }

  return (
    <div className="market-data-page">
      <h2>Рыночные данные MOEX</h2>

      <div className="exchange-rates">
        {DEMO_EXCHANGE_RATES.map(rate => (
          <div key={rate.pair} className="rate-chip">
            <span className="rate-pair">{rate.pair}</span>
            <span className="rate-value">{rate.rate.toFixed(2)} ₽</span>
          </div>
        ))}
      </div>

      <SecuritySearch onSelect={handleSelectSecurity} />

      <div className="quotes-grid">
        {DEMO_QUOTES.map(quote => {
          const sec = securitiesMap.get(quote.ticker)
          return (
            <QuoteCard
              key={quote.ticker}
              quote={quote}
              name={sec?.shortName ?? quote.ticker}
              selected={selectedTicker === quote.ticker}
              onClick={() => setSelectedTicker(quote.ticker)}
            />
          )
        })}
      </div>

      {selectedTicker && (
        <div className="detail-section">
          <h3>{selectedSecurity?.name ?? selectedTicker}</h3>

          {isBond && <BondDetails bond={DEMO_BOND} />}

          <PriceChart ticker={selectedTicker} />
        </div>
      )}

      {!selectedTicker && (
        <div className="no-selection">
          Выберите инструмент для просмотра графика и деталей
        </div>
      )}
    </div>
  )
}
