import { useState } from 'react'
import type { AllocationRule } from '../domain/models'
import { calculateAge, calculateAgeBasedAllocation } from '../domain/age-calculator'

interface AgeBasedCalculatorProps {
  onApply: (rules: AllocationRule[]) => void
}

export function AgeBasedCalculator({ onApply }: AgeBasedCalculatorProps) {
  const [birthYear, setBirthYear] = useState<number>(1990)
  const [preview, setPreview] = useState<AllocationRule[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleCalculate() {
    setError(null)
    try {
      const age = calculateAge(birthYear)
      const rules = calculateAgeBasedAllocation(age)
      setPreview(rules)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка расчёта')
      setPreview(null)
    }
  }

  const age = calculateAge(birthYear)

  return (
    <div className="age-calculator">
      <h3>Расчёт по возрасту</h3>
      <p className="age-description">
        Правило «100 минус возраст» — простой способ определить соотношение акций и облигаций.
      </p>

      <div className="form-group">
        <label htmlFor="birth-year">Год рождения:</label>
        <input
          id="birth-year"
          type="number"
          min={1925}
          max={2008}
          value={birthYear}
          onChange={e => setBirthYear(Number(e.target.value))}
        />
        <span className="age-display">
          (возраст: {age} {age >= 18 && age <= 99 ? 'лет' : ''})
        </span>
      </div>

      <button className="btn btn-secondary" onClick={handleCalculate}>
        Рассчитать
      </button>

      {error && <p className="error" role="alert">{error}</p>}

      {preview && (
        <div className="age-preview">
          <h4>Рекомендуемое распределение:</h4>
          <ul>
            {preview.map(rule => (
              <li key={rule.id}>
                {rule.category}: <strong>{rule.targetPercent}%</strong>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary" onClick={() => onApply(preview)}>
            Применить
          </button>
        </div>
      )}
    </div>
  )
}
