import { useState } from 'react'
import type { WeightEntry } from '../domain/models'
import { todayISO } from '../domain/formatters'

interface WeightEntryFormProps {
  onAdd: (entry: WeightEntry) => void
}

export function WeightEntryForm({ onAdd }: WeightEntryFormProps) {
  const [date, setDate] = useState(todayISO())
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0 || w > 300) return
    if (!date) return

    onAdd({
      id: `${date}-${Date.now()}`,
      date,
      weight: w,
      note: note.trim() || undefined,
    })

    setWeight('')
    setNote('')
  }

  return (
    <div className="entry-form">
      <h3>Записать вес</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="entry-date">Дата</label>
            <input
              id="entry-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={todayISO()}
            />
          </div>
          <div className="form-field">
            <label htmlFor="entry-weight">Вес (кг)</label>
            <input
              id="entry-weight"
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="85.0"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="entry-note">Заметка</label>
            <input
              id="entry-note"
              type="text"
              placeholder="Необязательно"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </div>
      </form>
    </div>
  )
}
