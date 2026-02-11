import { useState } from 'react'
import { AllocationPage } from './features/target-allocation/ui/AllocationPage'
import { OptimizationDashboard } from './features/portfolio-optimization/ui/OptimizationDashboard'
import { DiversificationDashboard } from './features/diversification/ui/DiversificationDashboard'

type Page = 'allocation' | 'diversification' | 'optimization'

export function App() {
  const [page, setPage] = useState<Page>('allocation')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Мои Инвестиции</h1>
        <nav className="app-nav">
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
        </nav>
      </header>
      <main className="app-main">
        {page === 'allocation' && <AllocationPage />}
        {page === 'diversification' && (
          <DiversificationDashboard report={null} onAnalyze={() => {}} />
        )}
        {page === 'optimization' && (
          <OptimizationDashboard result={null} onRunAnalysis={() => {}} />
        )}
      </main>
    </div>
  )
}
