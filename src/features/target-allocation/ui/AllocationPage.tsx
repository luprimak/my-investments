import { useState, useCallback } from 'react'
import type { AllocationRule, AllocationConstraint, AllocationTemplate, TargetAllocation, AllocationHistoryEntry } from '../domain/models'
import { TemplateSelector } from './TemplateSelector'
import { AllocationEditor } from './AllocationEditor'
import { DeviationDashboard } from './DeviationDashboard'
import { AllocationHistory } from './AllocationHistory'
import { AgeBasedCalculator } from './AgeBasedCalculator'
import { createAllocation, getActiveAllocation, getUserAllocations, updateAllocation } from '../services/allocation-service'
import { recordChange, getUserHistory } from '../services/history-service'
import type { AllocationSource, Deviation } from '../domain/models'
import './AllocationPage.css'

type View = 'overview' | 'templates' | 'editor' | 'age-calculator'

const DEMO_USER_ID = 'user-1'

export function AllocationPage() {
  const [view, setView] = useState<View>('overview')
  const [editorSource, setEditorSource] = useState<AllocationSource>('custom')
  const [editorRules, setEditorRules] = useState<AllocationRule[]>([])
  const [editorConstraints, setEditorConstraints] = useState<AllocationConstraint[]>([])
  const [editorName, setEditorName] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const active = getActiveAllocation(DEMO_USER_ID)
  const allAllocations = getUserAllocations(DEMO_USER_ID)
  const historyEntries = getUserHistory(DEMO_USER_ID)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  function handleSelectTemplate(template: AllocationTemplate) {
    setEditorSource('template')
    setEditorName(template.name)
    setEditorRules(template.rules.map(r => ({ ...r })))
    setEditorConstraints([])
    setView('editor')
  }

  function handleAgeBasedApply(rules: AllocationRule[]) {
    setEditorSource('age-based')
    setEditorName('По возрасту (100 минус возраст)')
    setEditorRules(rules)
    setEditorConstraints([])
    setView('editor')
  }

  function handleSave(name: string, rules: AllocationRule[], constraints: AllocationConstraint[]) {
    const prevActive = getActiveAllocation(DEMO_USER_ID)

    if (prevActive) {
      recordChange(DEMO_USER_ID, prevActive.id, prevActive, `Заменено на "${name}"`)
    }

    const result = createAllocation({
      userId: DEMO_USER_ID,
      name,
      source: editorSource,
      rules,
      constraints,
      isActive: true,
    })

    if ('errors' in result) {
      return // editor shows validation errors
    }

    setView('overview')
    refresh()
  }

  function handleEditCurrent() {
    if (!active) return
    setEditorSource(active.source)
    setEditorName(active.name)
    setEditorRules(active.rules.map(r => ({ ...r })))
    setEditorConstraints(active.constraints.map(c => ({ ...c })))
    setView('editor')
  }

  // Placeholder deviations — real data requires portfolio from Issue #6
  const deviations: Deviation[] = []

  return (
    <div className="allocation-page" key={refreshKey}>
      <h2>Целевое распределение портфеля</h2>

      {view === 'overview' && (
        <div className="overview">
          {active ? (
            <div className="active-allocation">
              <h3>Текущая стратегия: {active.name}</h3>
              <p className="allocation-source">
                Источник: {sourceLabel(active.source)} | Обновлено: {formatDate(active.updatedAt)}
              </p>
              <ul className="rules-display">
                {active.rules.map(r => (
                  <li key={r.id}>
                    {r.category}: <strong>{r.targetPercent}%</strong>
                  </li>
                ))}
              </ul>
              {active.constraints.length > 0 && (
                <>
                  <h4>Ограничения:</h4>
                  <ul className="constraints-display">
                    {active.constraints.map(c => (
                      <li key={c.id}>
                        {constraintLabel(c.constraintType)}: {c.threshold}%
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="overview-actions">
                <button className="btn btn-secondary" onClick={handleEditCurrent}>
                  Редактировать
                </button>
              </div>
            </div>
          ) : (
            <div className="no-allocation">
              <p>Целевое распределение не настроено.</p>
              <p>Выберите один из способов настройки:</p>
            </div>
          )}

          <div className="allocation-options">
            <button className="btn btn-primary" onClick={() => setView('templates')}>
              Шаблоны стратегий
            </button>
            <button className="btn btn-primary" onClick={() => setView('age-calculator')}>
              Расчёт по возрасту
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setEditorSource('custom')
              setEditorName('')
              setEditorRules([
                { id: 'new-1', dimension: 'asset_class', category: 'Акции', targetPercent: 60 },
                { id: 'new-2', dimension: 'asset_class', category: 'Облигации', targetPercent: 30 },
                { id: 'new-3', dimension: 'asset_class', category: 'Денежные средства', targetPercent: 10 },
              ])
              setEditorConstraints([])
              setView('editor')
            }}>
              Создать вручную
            </button>
          </div>

          <DeviationDashboard deviations={deviations} />
          <AllocationHistory entries={historyEntries} />
        </div>
      )}

      {view === 'templates' && (
        <div>
          <button className="btn btn-back" onClick={() => setView('overview')}>← Назад</button>
          <TemplateSelector onSelect={handleSelectTemplate} />
        </div>
      )}

      {view === 'age-calculator' && (
        <div>
          <button className="btn btn-back" onClick={() => setView('overview')}>← Назад</button>
          <AgeBasedCalculator onApply={handleAgeBasedApply} />
        </div>
      )}

      {view === 'editor' && (
        <AllocationEditor
          name={editorName}
          initialRules={editorRules}
          initialConstraints={editorConstraints}
          onSave={handleSave}
          onCancel={() => setView('overview')}
        />
      )}
    </div>
  )
}

function sourceLabel(source: AllocationSource): string {
  const labels: Record<AllocationSource, string> = {
    template: 'Шаблон',
    custom: 'Пользовательская',
    'age-based': 'По возрасту',
  }
  return labels[source]
}

function constraintLabel(type: string): string {
  const labels: Record<string, string> = {
    max_single_issuer: 'Макс. на одного эмитента',
    max_single_sector: 'Макс. на один сектор',
    min_asset_class: 'Мин. на класс актива',
  }
  return labels[type] ?? type
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
