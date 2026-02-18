import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeightPage } from '../WeightPage'

// Mock localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
  length: 0,
  key: vi.fn(() => null),
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('WeightPage', () => {
  it('renders the page title', () => {
    render(<WeightPage />)
    expect(screen.getByText(/Трекинг веса/)).toBeInTheDocument()
  })

  it('renders the entry form', () => {
    render(<WeightPage />)
    expect(screen.getByText('Записать вес')).toBeInTheDocument()
    expect(screen.getByText('Добавить')).toBeInTheDocument()
  })

  it('shows empty state in history when no entries', () => {
    render(<WeightPage />)
    expect(screen.getByText(/Нет записей/)).toBeInTheDocument()
  })

  it('renders chart placeholder with no data', () => {
    render(<WeightPage />)
    expect(screen.getByText(/минимум 2 записи/)).toBeInTheDocument()
  })

  it('shows stats when entries exist', () => {
    const entries = [
      { id: '1', date: '2025-01-01', weight: 95 },
      { id: '2', date: '2025-01-08', weight: 94 },
    ]
    store['weight-tracker-entries'] = JSON.stringify(entries)
    render(<WeightPage />)
    expect(screen.getByText('Текущий вес')).toBeInTheDocument()
    expect(screen.getByText('Потеряно')).toBeInTheDocument()
    expect(screen.getByText('Осталось')).toBeInTheDocument()
  })
})
