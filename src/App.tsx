import { useState } from 'react'
import { PortfolioPage } from './features/portfolio-view/ui/PortfolioPage'
import { AllocationPage } from './features/target-allocation/ui/AllocationPage'
import { OptimizationDashboard } from './features/portfolio-optimization/ui/OptimizationDashboard'
import { DiversificationDashboard } from './features/diversification/ui/DiversificationDashboard'
import { ProfitabilityDashboard } from './features/profitability/ui/ProfitabilityDashboard'

type Page = 'portfolio' | 'allocation' | 'diversification' | 'optimization' | 'profitability'

export function App() {
  const [page, setPage] = useState<Page>('portfolio')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Мои Инвестиции</h1>
        <nav className="app-nav">
          <button
            className={`nav-btn ${page === 'portfolio' ? 'active' : ''}`}
            onClick={() => setPage('portfolio')}
          >
            Портфель
          </button>
          <button
            className={`nav-btn ${page === 'allocation' ? 'active' : ''}`}
            onClick={() => setPage('allocation')}
          >
            Целевое распределение
          </button>
          <button
            className={`nav-btn ${page === 'diversification' ? 'active' : ''}`}
            onClick={() => setPage('diversification')}
          >
            Диверсификация
          </button>
          <button
            className={`nav-btn ${page === 'optimization' ? 'active' : ''}`}
            onClick={() => setPage('optimization')}
          >
            Оптимизация
          </button>
          <button
            className={`nav-btn ${page === 'profitability' ? 'active' : ''}`}
            onClick={() => setPage('profitability')}
          >
            Доходность
          </button>
        </nav>
      </header>
      <main className="app-main">
        {page === 'portfolio' && <PortfolioPage />}
        {page === 'allocation' && <AllocationPage />}
        {page === 'diversification' && (
          <DiversificationDashboard report={null} onAnalyze={() => {}} />
        )}
        {page === 'optimization' && (
          <OptimizationDashboard result={null} onRunAnalysis={() => {}} />
        )}
        {page === 'profitability' && <ProfitabilityDashboard />}
      </main>
    </div>
  )
}
