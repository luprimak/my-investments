import { useState } from 'react'
import { PortfolioSummary } from './PortfolioSummary'
import { HoldingsTable } from './HoldingsTable'
import { BrokerBreakdown } from './BrokerBreakdown'
import { AllocationChart } from './AllocationChart'
import { getAllPositions, getBrokerAccounts } from '../services/portfolio-service'
import { computeMetrics } from '../services/metrics-service'
import './PortfolioPage.css'

type View = 'summary' | 'holdings' | 'brokers'

export function PortfolioPage() {
  const [view, setView] = useState<View>('summary')

  const positions = getAllPositions()
  const metrics = computeMetrics(positions)
  const accounts = getBrokerAccounts()

  return (
    <div className="portfolio-page">
      <h2>Портфель</h2>

      <PortfolioSummary metrics={metrics} />

      <div className="portfolio-tabs">
        <button
          className={`portfolio-tab ${view === 'summary' ? 'active' : ''}`}
          onClick={() => setView('summary')}
        >
          Обзор
        </button>
        <button
          className={`portfolio-tab ${view === 'holdings' ? 'active' : ''}`}
          onClick={() => setView('holdings')}
        >
          Все позиции
        </button>
        <button
          className={`portfolio-tab ${view === 'brokers' ? 'active' : ''}`}
          onClick={() => setView('brokers')}
        >
          По брокерам
        </button>
      </div>

      {view === 'summary' && (
        <div>
          <AllocationChart
            data={metrics.allocationByAssetClass}
            title="Распределение по классам активов"
          />
          <AllocationChart
            data={metrics.allocationBySector}
            title="Распределение по секторам"
          />
        </div>
      )}

      {view === 'holdings' && <HoldingsTable positions={positions} />}

      {view === 'brokers' && <BrokerBreakdown accounts={accounts} />}
    </div>
  )
}
