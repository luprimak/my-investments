import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeightHistory } from '../WeightHistory'
import type { WeightEntry } from '../../domain/models'

const ENTRIES: WeightEntry[] = [
  { id: '1', date: '2025-01-01', weight: 95.0, note: 'Начало' },
  { id: '2', date: '2025-01-02', weight: 94.5 },
  { id: '3', date: '2025-01-03', weight: 94.2 },
]

describe('WeightHistory', () => {
  it('renders all entries', () => {
    render(<WeightHistory entries={ENTRIES} onDelete={vi.fn()} />)
    expect(screen.getByText(/95\.0 кг/)).toBeInTheDocument()
    expect(screen.getByText(/94\.5 кг/)).toBeInTheDocument()
    expect(screen.getByText(/94\.2 кг/)).toBeInTheDocument()
  })

  it('shows entry count in header', () => {
    render(<WeightHistory entries={ENTRIES} onDelete={vi.fn()} />)
    expect(screen.getByText(/История \(3\)/)).toBeInTheDocument()
  })

  it('shows note when present', () => {
    render(<WeightHistory entries={ENTRIES} onDelete={vi.fn()} />)
    expect(screen.getByText('Начало')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn()
    render(<WeightHistory entries={ENTRIES} onDelete={onDelete} />)
    const deleteButtons = screen.getAllByTitle('Удалить')
    fireEvent.click(deleteButtons[0]!)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no entries', () => {
    render(<WeightHistory entries={[]} onDelete={vi.fn()} />)
    expect(screen.getByText(/Нет записей/)).toBeInTheDocument()
  })

  it('renders export CSV button', () => {
    render(<WeightHistory entries={ENTRIES} onDelete={vi.fn()} />)
    expect(screen.getByText('Экспорт CSV')).toBeInTheDocument()
  })
})
