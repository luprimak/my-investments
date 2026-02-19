import type { AggregatedPortfolio } from '../domain/models'
import { BROKER_META } from '../domain/broker-types'

interface ConsolidatedPortfolioProps {
  portfolio: AggregatedPortfolio
}

function formatCurrency(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ConsolidatedPortfolio({ portfolio }: ConsolidatedPortfolioProps) {
  const { consolidatedPositions } = portfolio

  return (
    <div className="consolidated-section">
      <h3>Консолидированный портфель</h3>
      <table className="consolidated-table">
        <thead>
          <tr>
            <th>Тикер</th>
            <th>Название</th>
            <th>Брокеры</th>
            <th className="text-right">Кол-во</th>
            <th className="text-right">Ср. цена</th>
            <th className="text-right">Стоимость</th>
            <th className="text-right">Доход</th>
          </tr>
        </thead>
        <tbody>
          {consolidatedPositions.map(pos => {
            const pnlClass = pos.totalPnL >= 0 ? 'positive' : 'negative'
            const pnlSign = pos.totalPnL >= 0 ? '+' : ''
            const pnlPercent = pos.totalQuantity * pos.weightedAveragePrice > 0
              ? (pos.totalPnL / (pos.totalQuantity * pos.weightedAveragePrice)) * 100
              : 0

            return (
              <tr key={pos.ticker}>
                <td><strong>{pos.ticker}</strong></td>
                <td>{pos.name}</td>
                <td>
                  <div className="broker-chips">
                    {pos.holdings.map(h => (
                      <span
                        key={h.brokerId}
                        className="broker-chip"
                        style={{ background: BROKER_META[h.broker].color }}
                        title={`${BROKER_META[h.broker].shortName}: ${h.quantity} шт`}
                      >
                        {BROKER_META[h.broker].shortName}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-right">{pos.totalQuantity.toLocaleString('ru-RU')}</td>
                <td className="text-right">{formatCurrency(pos.weightedAveragePrice)}</td>
                <td className="text-right">{formatCurrency(pos.totalValue)}</td>
                <td className={`text-right ${pnlClass}`}>
                  {pnlSign}{formatCurrency(pos.totalPnL)} ({pnlSign}{pnlPercent.toFixed(2)}%)
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
