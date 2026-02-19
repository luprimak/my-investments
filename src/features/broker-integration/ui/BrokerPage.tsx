import { useState } from 'react'
import { DEMO_CONNECTIONS, DEMO_TRANSACTIONS, getDemoAggregatedPortfolio } from '../services/demo-data'
import { BrokerConnectionList } from './BrokerConnectionList'
import { ConsolidatedPortfolio } from './ConsolidatedPortfolio'
import { TransactionHistory } from './TransactionHistory'
import './BrokerPage.css'

type View = 'overview' | 'positions' | 'transactions'

const VIEW_LABELS: Record<View, string> = {
  overview: 'Обзор',
  positions: 'Позиции',
  transactions: 'Операции',
}

function formatCurrency(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BrokerPage() {
  const [view, setView] = useState<View>('overview')

  const aggregated = getDemoAggregatedPortfolio()
  const connections = DEMO_CONNECTIONS
  const transactions = DEMO_TRANSACTIONS

  const pnlClass = aggregated.totalPnL >= 0 ? 'positive' : 'negative'
  const pnlSign = aggregated.totalPnL >= 0 ? '+' : ''
  const pnlPercent = aggregated.totalValue > 0
    ? (aggregated.totalPnL / (aggregated.totalValue - aggregated.totalPnL)) * 100
    : 0

  const totalPositions = aggregated.consolidatedPositions.length
  const activeBrokers = connections.filter(c => c.status === 'active').length

  return (
    <div className="broker-page">
      <h2>Брокерские счета</h2>

      <div className="broker-summary">
        <div className="summary-card">
          <div className="summary-card-label">Общая стоимость</div>
          <div className="summary-card-value">{formatCurrency(aggregated.totalValue)} ₽</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Доход / Убыток</div>
          <div className={`summary-card-value ${pnlClass}`}>
            {pnlSign}{formatCurrency(aggregated.totalPnL)} ₽ ({pnlSign}{pnlPercent.toFixed(2)}%)
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Позиций</div>
          <div className="summary-card-value">{totalPositions}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Брокеров</div>
          <div className="summary-card-value">{activeBrokers} из {connections.length}</div>
        </div>
      </div>

      <div className="view-toggle">
        {(['overview', 'positions', 'transactions'] as View[]).map(v => (
          <button
            key={v}
            className={`view-toggle-btn ${view === v ? 'active' : ''}`}
            onClick={() => setView(v)}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      {view === 'overview' && (
        <BrokerConnectionList connections={connections} />
      )}

      {view === 'positions' && (
        <ConsolidatedPortfolio portfolio={aggregated} />
      )}

      {view === 'transactions' && (
        <TransactionHistory transactions={transactions} />
      )}
    </div>
  )
}
