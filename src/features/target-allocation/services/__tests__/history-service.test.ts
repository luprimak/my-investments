import { describe, it, expect, beforeEach } from 'vitest'
import { recordChange, getUserHistory, getAllocationHistory, _resetHistory } from '../history-service'
import type { TargetAllocation } from '../../domain/models'

const SNAPSHOT: TargetAllocation = {
  id: 'alloc-1',
  userId: 'user-1',
  name: 'Умеренная',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  isActive: false,
  source: 'template',
  rules: [
    { id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 60 },
    { id: '2', dimension: 'asset_class', category: 'Облигации', targetPercent: 40 },
  ],
  constraints: [],
}

beforeEach(() => {
  _resetHistory()
})

describe('recordChange', () => {
  it('creates a history entry', () => {
    const entry = recordChange('user-1', 'alloc-1', SNAPSHOT, 'Переход на агрессивную')

    expect(entry.userId).toBe('user-1')
    expect(entry.allocationId).toBe('alloc-1')
    expect(entry.previousSnapshot).toEqual(SNAPSHOT)
    expect(entry.reason).toBe('Переход на агрессивную')
    expect(entry.changedAt).toBeDefined()
  })
})

describe('getUserHistory', () => {
  it('returns entries for the given user, newest first', () => {
    recordChange('user-1', 'alloc-1', SNAPSHOT, 'Change 1')
    recordChange('user-1', 'alloc-2', { ...SNAPSHOT, id: 'alloc-2' }, 'Change 2')
    recordChange('user-2', 'alloc-3', { ...SNAPSHOT, userId: 'user-2' }, 'Other user')

    const history = getUserHistory('user-1')
    expect(history).toHaveLength(2)
    expect(history[0]!.reason).toBe('Change 2')
  })

  it('returns empty array for user with no history', () => {
    expect(getUserHistory('no-one')).toEqual([])
  })
})

describe('getAllocationHistory', () => {
  it('returns entries for a specific allocation', () => {
    recordChange('user-1', 'alloc-1', SNAPSHOT, 'First')
    recordChange('user-1', 'alloc-1', SNAPSHOT, 'Second')
    recordChange('user-1', 'alloc-2', SNAPSHOT, 'Other allocation')

    const history = getAllocationHistory('alloc-1')
    expect(history).toHaveLength(2)
  })
})
