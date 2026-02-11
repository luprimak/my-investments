import { describe, it, expect, beforeEach } from 'vitest'
import {
  storeRecommendations,
  updateRecommendationStatus,
  getAllRecommendations,
  getPendingRecommendations,
  getAcceptedRecommendations,
  clearRecommendations,
  _resetRecommendationStore,
} from '../recommendation-store'
import type { Recommendation } from '../../domain/models'

function makeRec(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'rec-1',
    type: 'rebalance_trade',
    priority: 'medium',
    title: 'Test',
    reason: 'Test reason',
    impact: { estimatedCommission: 0, estimatedTax: 0, totalCost: 0, portfolioImprovement: 'Test' },
    actions: [],
    status: 'pending',
    ...overrides,
  }
}

beforeEach(() => {
  _resetRecommendationStore()
})

describe('storeRecommendations', () => {
  it('stores new recommendations', () => {
    storeRecommendations([makeRec({ id: 'r1' }), makeRec({ id: 'r2' })])
    expect(getAllRecommendations()).toHaveLength(2)
  })

  it('updates existing recommendations by ID', () => {
    storeRecommendations([makeRec({ id: 'r1', title: 'Old' })])
    storeRecommendations([makeRec({ id: 'r1', title: 'New' })])

    const all = getAllRecommendations()
    expect(all).toHaveLength(1)
    expect(all[0]!.title).toBe('New')
  })
})

describe('updateRecommendationStatus', () => {
  it('updates status to accepted', () => {
    storeRecommendations([makeRec({ id: 'r1' })])
    expect(updateRecommendationStatus('r1', 'accepted')).toBe(true)
    expect(getAcceptedRecommendations()).toHaveLength(1)
  })

  it('updates status to dismissed', () => {
    storeRecommendations([makeRec({ id: 'r1' })])
    expect(updateRecommendationStatus('r1', 'dismissed')).toBe(true)
    expect(getPendingRecommendations()).toHaveLength(0)
  })

  it('returns false for unknown ID', () => {
    expect(updateRecommendationStatus('unknown', 'accepted')).toBe(false)
  })
})

describe('getPendingRecommendations', () => {
  it('returns only pending recommendations', () => {
    storeRecommendations([
      makeRec({ id: 'r1', status: 'pending' }),
      makeRec({ id: 'r2', status: 'accepted' }),
      makeRec({ id: 'r3', status: 'dismissed' }),
    ])

    expect(getPendingRecommendations()).toHaveLength(1)
    expect(getPendingRecommendations()[0]!.id).toBe('r1')
  })
})

describe('clearRecommendations', () => {
  it('removes all recommendations', () => {
    storeRecommendations([makeRec({ id: 'r1' }), makeRec({ id: 'r2' })])
    clearRecommendations()
    expect(getAllRecommendations()).toHaveLength(0)
  })
})
