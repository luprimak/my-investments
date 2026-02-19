import { useState, useMemo } from 'react'
import type { AnalysisPeriod, ReportConfig, GeneratedReport } from '../domain/models'
import { getDemoAnalytics, getDemoTaxTransactions } from '../services/demo-data'
import { computeTaxReport } from '../engines/tax-engine'
import { generateReport } from '../services/report-service'
import { PeriodSelector } from './PeriodSelector'
import { PortfolioValueChart } from './PortfolioValueChart'
import { AllocationPieChart } from './AllocationPieChart'
import { BenchmarkComparison } from './BenchmarkComparison'
import { GeographyBreakdown } from './GeographyBreakdown'
import { RiskMetricsPanel } from './RiskMetricsPanel'
import { CorrelationMatrix } from './CorrelationMatrix'
import { ReportBuilder } from './ReportBuilder'
import { TaxSummary } from './TaxSummary'
import { TransactionHistory } from './TransactionHistory'
import './AnalyticsPage.css'

type AnalyticsTab = 'overview' | 'charts' | 'metrics' | 'reports' | 'tax'

const TAB_LABELS: Record<AnalyticsTab, string> = {
  overview: 'Обзор',
  charts: 'Графики',
  metrics: 'Метрики',
  reports: 'Отчёты',
  tax: 'Налоги',
}

export function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>('overview')
  const [period, setPeriod] = useState<AnalysisPeriod>('1Y')

  const analytics = useMemo(() => getDemoAnalytics(period), [period])
  const taxTransactions = useMemo(() => getDemoTaxTransactions(), [])
  const taxReport = useMemo(
    () => computeTaxReport(taxTransactions, { year: 2025 }),
    [taxTransactions],
  )

  const totalValue = analytics.portfolioTimeSeries.points.length > 0
    ? analytics.portfolioTimeSeries.points[analytics.portfolioTimeSeries.points.length - 1]!.value
    : 0

  function handleGenerateReport(config: ReportConfig): GeneratedReport | null {
    return generateReport(config, analytics, taxReport, taxTransactions)
  }

  const tabs: AnalyticsTab[] = ['overview', 'charts', 'metrics', 'reports', 'tax']

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Аналитика</h2>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </div>

      <div className="analytics-tabs">
        {tabs.map(t => (
          <button
            key={t}
            className={`analytics-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="analytics-overview">
          <div className="overview-cards">
            <div className="overview-card">
              <div className="overview-card-label">Стоимость портфеля</div>
              <div className="overview-card-value">{totalValue.toLocaleString('ru-RU')} ₽</div>
            </div>
            <div className="overview-card">
              <div className="overview-card-label">Доходность</div>
              <div className={`overview-card-value ${analytics.portfolioTimeSeries.periodReturn >= 0 ? 'positive' : 'negative'}`}>
                {analytics.portfolioTimeSeries.periodReturn >= 0 ? '+' : ''}{analytics.portfolioTimeSeries.periodReturn.toFixed(2)}%
              </div>
            </div>
            <div className="overview-card">
              <div className="overview-card-label">Волатильность</div>
              <div className="overview-card-value">{analytics.riskMetrics.volatility.toFixed(2)}%</div>
            </div>
            <div className="overview-card">
              <div className="overview-card-label">Коэфф. Шарпа</div>
              <div className="overview-card-value">{analytics.riskMetrics.sharpeRatio.toFixed(2)}</div>
            </div>
          </div>

          <PortfolioValueChart series={analytics.portfolioTimeSeries} />

          <div className="overview-allocations">
            <AllocationPieChart data={analytics.allocation.byAssetClass} title="По типу актива" />
            <AllocationPieChart data={analytics.allocation.bySector} title="По секторам" />
          </div>
        </div>
      )}

      {tab === 'charts' && (
        <div className="analytics-charts">
          <div className="chart-section">
            <h3>Стоимость портфеля</h3>
            <PortfolioValueChart series={analytics.portfolioTimeSeries} />
          </div>

          {analytics.benchmark && (
            <div className="chart-section">
              <h3>Сравнение с бенчмарком</h3>
              <BenchmarkComparison comparison={analytics.benchmark} />
            </div>
          )}

          <div className="chart-section">
            <GeographyBreakdown data={analytics.allocation.byGeography} />
          </div>

          <div className="chart-section-row">
            <AllocationPieChart data={analytics.allocation.byAssetClass} title="Типы активов" />
            <AllocationPieChart data={analytics.allocation.bySector} title="Секторы" />
          </div>
        </div>
      )}

      {tab === 'metrics' && (
        <div className="analytics-metrics">
          <RiskMetricsPanel metrics={analytics.riskMetrics} />
          {analytics.correlationMatrix && (
            <CorrelationMatrix matrix={analytics.correlationMatrix} />
          )}
        </div>
      )}

      {tab === 'reports' && (
        <div className="analytics-reports">
          <ReportBuilder onGenerate={handleGenerateReport} />
        </div>
      )}

      {tab === 'tax' && (
        <div className="analytics-tax">
          <TaxSummary report={taxReport} />
          <TransactionHistory transactions={taxTransactions} />
        </div>
      )}
    </div>
  )
}
