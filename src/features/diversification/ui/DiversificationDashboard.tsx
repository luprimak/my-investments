import type { DiversificationReport } from '../domain/models'
import { ScoreDisplay } from './ScoreDisplay'
import { DimensionBreakdown } from './DimensionBreakdown'
import { RecommendationsList } from './RecommendationsList'
import { classifyHHI } from '../services/hhi-calculator'
import './DiversificationDashboard.css'

interface DiversificationDashboardProps {
  report: DiversificationReport | null
  onAnalyze: () => void
}

export function DiversificationDashboard({ report, onAnalyze }: DiversificationDashboardProps) {
  return (
    <div className="diversification-dashboard">
      <div className="dashboard-header">
        <h2>Диверсификация портфеля</h2>
        <button className="btn btn-primary" onClick={onAnalyze}>
          Анализировать
        </button>
      </div>

      {!report ? (
        <div className="no-data-container">
          <p>Нажмите «Анализировать» для оценки диверсификации портфеля.</p>
        </div>
      ) : (
        <>
          <div className="report-overview">
            <ScoreDisplay score={report.overallScore} rating={report.overallRating} />

            <div className="report-meta">
              <div className="meta-item">
                <span className="meta-label">HHI портфеля</span>
                <span className="meta-value">{(report.herfindahlIndex * 10000).toFixed(0)}</span>
                <span className="meta-desc">{classifyHHI(report.herfindahlIndex) === 'low' ? 'Хорошо' : classifyHHI(report.herfindahlIndex) === 'moderate' ? 'Умеренно' : 'Высоко'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Измерений</span>
                <span className="meta-value">{report.dimensions.length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Рекомендаций</span>
                <span className="meta-value">{report.recommendations.length}</span>
              </div>
            </div>
          </div>

          <div className="dimensions-grid">
            {report.dimensions.map(dim => (
              <DimensionBreakdown key={dim.dimension} analysis={dim} />
            ))}
          </div>

          <RecommendationsList recommendations={report.recommendations} />
        </>
      )}
    </div>
  )
}
