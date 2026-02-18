import { useState } from 'react'
import type { ReturnPeriod } from '../domain/models'
import { DEFAULT_PERIOD } from '../domain/constants'
import { PeriodSelector } from './PeriodSelector'
import { PortfolioReturnSummary } from './PortfolioSummary'
import { PositionReturns } from './PositionReturns'
import { ReturnChart } from './ReturnChart'
import { getDemoReport } from '../services/profitability-service'
import './ProfitabilityDashboard.css'

export function ProfitabilityDashboard() {
  const [period, setPeriod] = useState<ReturnPeriod>(DEFAULT_PERIOD)
  const report = getDemoReport(period)
  const { portfolioReturn, bestPerformers, worstPerformers } = report

  return (
    <div className="profitability-dashboard">
      <h2>Доходность портфеля</h2>

      <PeriodSelector activePeriod={period} onPeriodChange={setPeriod} />

      <PortfolioReturnSummary data={portfolioReturn} />

      <div className="performers-section">
        <div className="performers-card">
          <h3>Лучшие позиции</h3>
          {bestPerformers.map(p => (
            <div key={p.ticker} className="performer-item">
              <span>{p.ticker} — {p.name}</span>
              <span className="performer-return return-positive">
                +{p.relativeReturn.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
        <div className="performers-card">
          <h3>Худшие позиции</h3>
          {worstPerformers.map(p => (
            <div key={p.ticker} className="performer-item">
              <span>{p.ticker} — {p.name}</span>
              <span className={`performer-return ${p.relativeReturn < 0 ? 'return-negative' : 'return-positive'}`}>
                {p.relativeReturn > 0 ? '+' : ''}{p.relativeReturn.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <ReturnChart positions={portfolioReturn.positions} />
      <PositionReturns positions={portfolioReturn.positions} />
    </div>
  )
}
