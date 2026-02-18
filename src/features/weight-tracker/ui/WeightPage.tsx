import { useState, useCallback } from 'react'
import { WeightEntryForm } from './WeightEntryForm'
import { WeightChart } from './WeightChart'
import { WeightStatsPanel } from './WeightStats'
import { WeightHistory } from './WeightHistory'
import { loadEntries, loadGoal, addEntry, deleteEntry } from '../services/storage-service'
import { computeStats, getRecentEntries } from '../services/stats-service'
import type { WeightEntry } from '../domain/models'
import { formatWeight } from '../domain/formatters'
import './WeightPage.css'

export function WeightPage() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [, setRefreshKey] = useState(0)
  const goal = loadGoal()

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  function handleAdd(entry: WeightEntry) {
    const updated = addEntry(entry)
    setEntries(updated)
    refresh()
  }

  function handleDelete(id: string) {
    const updated = deleteEntry(id)
    setEntries(updated)
    refresh()
  }

  const stats = computeStats(entries, goal)
  const recentEntries = getRecentEntries(entries, 30)

  return (
    <div className="weight-page">
      <h2>Трекинг веса: {formatWeight(goal.startWeight)} → {formatWeight(goal.targetWeight)}</h2>

      {/* Progress bar */}
      {stats && (
        <div className="progress-section">
          <div className="progress-header">
            <span>Прогресс к цели</span>
            <span>{stats.progressPercent.toFixed(0)}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.max(2, stats.progressPercent)}%` }}
            >
              {stats.progressPercent >= 10 ? `${stats.progressPercent.toFixed(0)}%` : ''}
            </div>
          </div>
          <div className="progress-labels">
            <span className="progress-start">{formatWeight(goal.startWeight)}</span>
            <span className="progress-target">Цель: {formatWeight(goal.targetWeight)}</span>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {stats && (
        <div className="weight-summary">
          <div className="weight-card">
            <span className="weight-card-value">{formatWeight(stats.currentWeight)}</span>
            <span className="weight-card-label">Текущий вес</span>
          </div>
          <div className="weight-card">
            <span className="weight-card-value change-good">
              -{formatWeight(Math.max(0, stats.totalLost))}
            </span>
            <span className="weight-card-label">Потеряно</span>
          </div>
          <div className="weight-card">
            <span className="weight-card-value">{formatWeight(Math.max(0, stats.remainingToGoal))}</span>
            <span className="weight-card-label">Осталось</span>
          </div>
          <div className="weight-card">
            <span className="weight-card-value">{stats.daysTracked}</span>
            <span className="weight-card-label">Дней</span>
          </div>
        </div>
      )}

      <WeightEntryForm onAdd={handleAdd} />
      <WeightChart entries={entries} goal={goal} />
      {stats && <WeightStatsPanel stats={stats} />}
      <WeightHistory entries={recentEntries} onDelete={handleDelete} />
    </div>
  )
}
