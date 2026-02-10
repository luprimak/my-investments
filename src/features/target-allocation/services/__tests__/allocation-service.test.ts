import { describe, it, expect, beforeEach } from 'vitest'
import {
  createAllocation,
  getActiveAllocation,
  getUserAllocations,
  updateAllocation,
  deleteAllocation,
  _resetAllocations,
} from '../allocation-service'
import type { AllocationRule } from '../../domain/models'

const VALID_RULES: AllocationRule[] = [
  { id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 60 },
  { id: '2', dimension: 'asset_class', category: 'Облигации', targetPercent: 40 },
]

const USER_ID = 'user-1'

beforeEach(() => {
  _resetAllocations()
})

describe('createAllocation', () => {
  it('creates a valid allocation', () => {
    const result = createAllocation({
      userId: USER_ID,
      name: 'Тест',
      source: 'custom',
      rules: VALID_RULES,
    })

    expect('allocation' in result).toBe(true)
    if ('allocation' in result) {
      expect(result.allocation.name).toBe('Тест')
      expect(result.allocation.isActive).toBe(true)
      expect(result.allocation.rules).toHaveLength(2)
    }
  })

  it('returns validation errors for invalid rules', () => {
    const result = createAllocation({
      userId: USER_ID,
      name: 'Невалидная',
      source: 'custom',
      rules: [{ id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 50 }],
    })

    expect('errors' in result).toBe(true)
  })

  it('deactivates previous active allocation', () => {
    createAllocation({
      userId: USER_ID,
      name: 'Первая',
      source: 'custom',
      rules: VALID_RULES,
    })

    createAllocation({
      userId: USER_ID,
      name: 'Вторая',
      source: 'custom',
      rules: VALID_RULES,
    })

    const active = getActiveAllocation(USER_ID)
    expect(active?.name).toBe('Вторая')

    const all = getUserAllocations(USER_ID)
    const activeCount = all.filter(a => a.isActive).length
    expect(activeCount).toBe(1)
  })
})

describe('getActiveAllocation', () => {
  it('returns null when no allocations exist', () => {
    expect(getActiveAllocation(USER_ID)).toBeNull()
  })

  it('returns the active allocation', () => {
    createAllocation({
      userId: USER_ID,
      name: 'Активная',
      source: 'template',
      rules: VALID_RULES,
    })

    const active = getActiveAllocation(USER_ID)
    expect(active?.name).toBe('Активная')
  })
})

describe('updateAllocation', () => {
  it('updates allocation name', () => {
    const result = createAllocation({
      userId: USER_ID,
      name: 'Старое',
      source: 'custom',
      rules: VALID_RULES,
    })

    if (!('allocation' in result)) throw new Error('expected allocation')

    const updated = updateAllocation(result.allocation.id, { name: 'Новое' })
    expect(updated).not.toBeNull()
    if (updated && 'allocation' in updated) {
      expect(updated.allocation.name).toBe('Новое')
    }
  })

  it('returns null for non-existent allocation', () => {
    expect(updateAllocation('nonexistent', { name: 'test' })).toBeNull()
  })

  it('validates updated rules', () => {
    const result = createAllocation({
      userId: USER_ID,
      name: 'Тест',
      source: 'custom',
      rules: VALID_RULES,
    })

    if (!('allocation' in result)) throw new Error('expected allocation')

    const updated = updateAllocation(result.allocation.id, {
      rules: [{ id: '1', dimension: 'asset_class', category: 'A', targetPercent: 50 }],
    })

    expect(updated && 'errors' in updated).toBe(true)
  })
})

describe('deleteAllocation', () => {
  it('removes an allocation', () => {
    const result = createAllocation({
      userId: USER_ID,
      name: 'Удалить',
      source: 'custom',
      rules: VALID_RULES,
    })

    if (!('allocation' in result)) throw new Error('expected allocation')

    expect(deleteAllocation(result.allocation.id)).toBe(true)
    expect(getUserAllocations(USER_ID)).toHaveLength(0)
  })

  it('returns false for non-existent allocation', () => {
    expect(deleteAllocation('nonexistent')).toBe(false)
  })
})
