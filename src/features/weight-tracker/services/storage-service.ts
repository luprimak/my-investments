import type { WeightEntry, WeightGoal } from '../domain/models'
import { DEFAULT_GOAL } from '../domain/models'

const ENTRIES_KEY = 'weight-tracker-entries'
const GOAL_KEY = 'weight-tracker-goal'

export function loadEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as WeightEntry[]
  } catch {
    return []
  }
}

export function saveEntries(entries: WeightEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function loadGoal(): WeightGoal {
  try {
    const raw = localStorage.getItem(GOAL_KEY)
    if (!raw) return DEFAULT_GOAL
    return JSON.parse(raw) as WeightGoal
  } catch {
    return DEFAULT_GOAL
  }
}

export function saveGoal(goal: WeightGoal): void {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal))
}

export function addEntry(entry: WeightEntry): WeightEntry[] {
  const entries = loadEntries()
  const existing = entries.findIndex(e => e.date === entry.date)
  if (existing >= 0) {
    entries[existing] = entry
  } else {
    entries.push(entry)
  }
  entries.sort((a, b) => a.date.localeCompare(b.date))
  saveEntries(entries)
  return entries
}

export function deleteEntry(id: string): WeightEntry[] {
  const entries = loadEntries().filter(e => e.id !== id)
  saveEntries(entries)
  return entries
}

export function exportToCsv(entries: WeightEntry[]): string {
  const header = 'Дата,Вес (кг),Заметка'
  const rows = entries.map(e => `${e.date},${e.weight},${e.note ?? ''}`)
  return [header, ...rows].join('\n')
}
