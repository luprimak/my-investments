import type { WeightStats as Stats } from '../domain/models'
import { formatWeight, formatRate, formatDate, changeClass } from '../domain/formatters'

interface WeightStatsProps {
  stats: Stats
}

export function WeightStatsPanel({ stats }: WeightStatsProps) {
  return (
    <div className="chart-section">
      <h3>Статистика</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{formatWeight(stats.currentWeight)}</span>
          <span className="stat-label">Текущий вес</span>
        </div>
        <div className="stat-item">
          <span className={`stat-value ${changeClass(-stats.totalLost)}`}>
            {stats.totalLost > 0 ? '-' : '+'}{formatWeight(Math.abs(stats.totalLost))}
          </span>
          <span className="stat-label">Потеряно всего</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatWeight(stats.remainingToGoal)}</span>
          <span className="stat-label">До цели</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.progressPercent.toFixed(0)}%</span>
          <span className="stat-label">Прогресс</span>
        </div>
        <div className="stat-item">
          <span className={`stat-value ${changeClass(stats.weeklyRate)}`}>
            {formatRate(stats.weeklyRate)}
          </span>
          <span className="stat-label">Темп</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {stats.estimatedGoalDate ? formatDate(stats.estimatedGoalDate) : '—'}
          </span>
          <span className="stat-label">Прогноз достижения</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatWeight(stats.averageWeight)}</span>
          <span className="stat-label">Средний вес</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatWeight(stats.minWeight)}</span>
          <span className="stat-label">Минимум</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatWeight(stats.maxWeight)}</span>
          <span className="stat-label">Максимум</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.daysTracked}</span>
          <span className="stat-label">Дней отслеживания</span>
        </div>
      </div>
    </div>
  )
}
