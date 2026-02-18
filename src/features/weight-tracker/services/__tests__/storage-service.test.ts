import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadEntries, saveEntries, addEntry, deleteEntry, exportToCsv } from '../storage-service'
import type { WeightEntry } from '../../domain/models'

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

describe('loadEntries', () => {
  it('returns empty array when no data', () => {
    expect(loadEntries()).toEqual([])
  })

  it('returns parsed entries from localStorage', () => {
    const entries: WeightEntry[] = [{ id: '1', date: '2025-01-01', weight: 90 }]
    store['weight-tracker-entries'] = JSON.stringify(entries)
    expect(loadEntries()).toEqual(entries)
  })

  it('returns empty array for invalid JSON', () => {
    store['weight-tracker-entries'] = 'invalid'
    expect(loadEntries()).toEqual([])
  })
})

describe('saveEntries', () => {
  it('saves entries to localStorage', () => {
    const entries: WeightEntry[] = [{ id: '1', date: '2025-01-01', weight: 90 }]
    saveEntries(entries)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'weight-tracker-entries',
      JSON.stringify(entries)
    )
  })
})

describe('addEntry', () => {
  it('adds a new entry and sorts by date', () => {
    const result = addEntry({ id: '1', date: '2025-01-05', weight: 90 })
    expect(result).toHaveLength(1)
    const result2 = addEntry({ id: '2', date: '2025-01-01', weight: 95 })
    expect(result2).toHaveLength(2)
    expect(result2[0]!.date).toBe('2025-01-01')
  })

  it('updates existing entry with same date', () => {
    addEntry({ id: '1', date: '2025-01-01', weight: 90 })
    const result = addEntry({ id: '2', date: '2025-01-01', weight: 89 })
    expect(result).toHaveLength(1)
    expect(result[0]!.weight).toBe(89)
  })
})

describe('deleteEntry', () => {
  it('removes entry by id', () => {
    addEntry({ id: '1', date: '2025-01-01', weight: 90 })
    addEntry({ id: '2', date: '2025-01-02', weight: 89 })
    const result = deleteEntry('1')
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('2')
  })
})

describe('exportToCsv', () => {
  it('exports entries as CSV string', () => {
    const entries: WeightEntry[] = [
      { id: '1', date: '2025-01-01', weight: 95, note: 'Start' },
      { id: '2', date: '2025-01-02', weight: 94.5 },
    ]
    const csv = exportToCsv(entries)
    expect(csv).toContain('Дата,Вес (кг),Заметка')
    expect(csv).toContain('2025-01-01,95,Start')
    expect(csv).toContain('2025-01-02,94.5,')
  })
})
