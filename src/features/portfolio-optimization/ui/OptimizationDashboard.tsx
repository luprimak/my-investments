import { useState, useCallback } from 'react'
import type { OptimizationResult } from '../services/optimization-service'
import type { Recommendation } from '../domain/models'
import { JunkPositionsPanel } from './JunkPositionsPanel'
import { RebalancePlanView } from './RebalancePlanView'
import { BrokerComparisonPanel } from './BrokerComparisonPanel'
import { CostBreakdown } from './CostBreakdown'
import { updateRecommendationStatus } from '../services/recommendation-store'
import './OptimizationDashboard.css'

interface OptimizationDashboardProps {
  result: OptimizationResult | null
  onRunAnalysis: () => void
}

type Tab = 'junk' | 'rebalance' | 'brokers'

export function OptimizationDashboard({ result, onRunAnalysis }: OptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('rebalance')
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    result?.allRecommendations ?? [],
  )

  const handleAccept = useCallback((id: string) => {
    updateRecommendationStatus(id, 'accepted')
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'accepted' as const } : r,
    ))
  }, [])

  const handleDismiss = useCallback((id: string) => {
    updateRecommendationStatus(id, 'dismissed')
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'dismissed' as const } : r,
    ))
  }, [])

  const junkRecs = recommendations.filter(r => r.type === 'close_position')
  const rebalanceRecs = recommendations.filter(r => r.type === 'rebalance_trade')
  const brokerRecs = recommendations.filter(r => r.type === 'transfer' || r.type === 'close_account')

  return (
    <div className="optimization-dashboard">
      <div className="dashboard-header">
        <h2>Оптимизация портфеля</h2>
        <button className="btn btn-primary" onClick={onRunAnalysis}>
          Запустить анализ
        </button>
      </div>

      {!result ? (
        <div className="no-data-container">
          <p>Нажмите «Запустить анализ» для получения рекомендаций по оптимизации портфеля.</p>
        </div>
      ) : (
        <>
          <div className="summary-bar">
            <div className="summary-item">
              <span className="summary-count">{junkRecs.length}</span>
              <span className="summary-label">Мусорных позиций</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{rebalanceRecs.length}</span>
              <span className="summary-label">Ребалансировка</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{brokerRecs.length}</span>
              <span className="summary-label">Брокеры</span>
            </div>
            <div className="summary-item">
              <span className="summary-count">{recommendations.length}</span>
              <span className="summary-label">Всего рекомендаций</span>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'rebalance' ? 'active' : ''}`}
              onClick={() => setActiveTab('rebalance')}
            >
              Ребалансировка
            </button>
            <button
              className={`tab ${activeTab === 'junk' ? 'active' : ''}`}
              onClick={() => setActiveTab('junk')}
            >
              Мусорные позиции
            </button>
            <button
              className={`tab ${activeTab === 'brokers' ? 'active' : ''}`}
              onClick={() => setActiveTab('brokers')}
            >
              Брокеры
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'junk' && (
              <JunkPositionsPanel report={result.junkReport} />
            )}
            {activeTab === 'rebalance' && (
              <RebalancePlanView
                plan={{
                  ...result.rebalancePlan,
                  recommendations: rebalanceRecs,
                }}
                onAccept={handleAccept}
                onDismiss={handleDismiss}
              />
            )}
            {activeTab === 'brokers' && (
              <BrokerComparisonPanel
                plan={{
                  ...result.brokerPlan,
                  recommendations: brokerRecs,
                }}
                onAccept={handleAccept}
                onDismiss={handleDismiss}
              />
            )}
          </div>

          <CostBreakdown recommendations={recommendations} />
        </>
      )}
    </div>
  )
}
