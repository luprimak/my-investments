import { useState } from 'react'
import type { AllocationRule, AllocationConstraint } from '../domain/models'
import { validateAllocation, type ValidationError } from '../domain/validation'

interface AllocationEditorProps {
  initialRules: AllocationRule[]
  initialConstraints?: AllocationConstraint[]
  name: string
  onSave: (name: string, rules: AllocationRule[], constraints: AllocationConstraint[]) => void
  onCancel: () => void
}

export function AllocationEditor({
  initialRules,
  initialConstraints = [],
  name: initialName,
  onSave,
  onCancel,
}: AllocationEditorProps) {
  const [name, setName] = useState(initialName)
  const [rules, setRules] = useState<AllocationRule[]>(initialRules)
  const [constraints, setConstraints] = useState<AllocationConstraint[]>(initialConstraints)
  const [errors, setErrors] = useState<ValidationError[]>([])

  function handleRuleChange(index: number, field: 'category' | 'targetPercent', value: string | number) {
    setRules(prev => prev.map((r, i) =>
      i === index ? { ...r, [field]: field === 'targetPercent' ? Number(value) : value } : r
    ))
  }

  function handleAddRule() {
    setRules(prev => [
      ...prev,
      { id: `rule-${Date.now()}`, dimension: 'asset_class', category: '', targetPercent: 0 },
    ])
  }

  function handleRemoveRule(index: number) {
    setRules(prev => prev.filter((_, i) => i !== index))
  }

  function handleConstraintChange(index: number, value: number) {
    setConstraints(prev => prev.map((c, i) =>
      i === index ? { ...c, threshold: value } : c
    ))
  }

  function handleAddConstraint() {
    setConstraints(prev => [
      ...prev,
      { id: `cons-${Date.now()}`, constraintType: 'max_single_issuer', threshold: 15 },
    ])
  }

  function handleRemoveConstraint(index: number) {
    setConstraints(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    const validationErrors = validateAllocation(rules, constraints)
    setErrors(validationErrors)

    if (validationErrors.length === 0) {
      onSave(name, rules, constraints)
    }
  }

  const rulesTotal = rules.reduce((sum, r) => sum + r.targetPercent, 0)

  return (
    <div className="allocation-editor">
      <h3>Настройка распределения</h3>

      <div className="form-group">
        <label htmlFor="allocation-name">Название:</label>
        <input
          id="allocation-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Моя стратегия"
        />
      </div>

      <h4>Распределение по классам активов</h4>
      <div className="rules-list">
        {rules.map((rule, index) => (
          <div key={rule.id} className="rule-row">
            <input
              type="text"
              value={rule.category}
              onChange={e => handleRuleChange(index, 'category', e.target.value)}
              placeholder="Класс актива"
              aria-label={`Категория правила ${index + 1}`}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={rule.targetPercent}
              onChange={e => handleRuleChange(index, 'targetPercent', e.target.value)}
              aria-label={`Процент правила ${index + 1}`}
            />
            <span>%</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleRemoveRule(index)}
              aria-label={`Удалить правило ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="rules-summary">
        Итого: <strong className={rulesTotal === 100 ? 'valid' : 'invalid'}>{rulesTotal}%</strong>
        {rulesTotal !== 100 && <span className="hint"> (должно быть 100%)</span>}
      </div>

      <button className="btn btn-secondary btn-sm" onClick={handleAddRule}>
        + Добавить класс актива
      </button>

      <h4>Ограничения</h4>
      <div className="constraints-list">
        {constraints.map((constraint, index) => (
          <div key={constraint.id} className="constraint-row">
            <select
              value={constraint.constraintType}
              onChange={e =>
                setConstraints(prev => prev.map((c, i) =>
                  i === index ? { ...c, constraintType: e.target.value as AllocationConstraint['constraintType'] } : c
                ))
              }
              aria-label={`Тип ограничения ${index + 1}`}
            >
              <option value="max_single_issuer">Макс. на одного эмитента</option>
              <option value="max_single_sector">Макс. на один сектор</option>
              <option value="min_asset_class">Мин. на класс актива</option>
            </select>
            <input
              type="number"
              min={0}
              max={100}
              value={constraint.threshold}
              onChange={e => handleConstraintChange(index, Number(e.target.value))}
              aria-label={`Порог ограничения ${index + 1}`}
            />
            <span>%</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleRemoveConstraint(index)}
              aria-label={`Удалить ограничение ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button className="btn btn-secondary btn-sm" onClick={handleAddConstraint}>
        + Добавить ограничение
      </button>

      {errors.length > 0 && (
        <div className="validation-errors" role="alert">
          <h4>Ошибки валидации:</h4>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-actions">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Сохранить
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}
