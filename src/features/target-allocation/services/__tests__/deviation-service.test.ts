import { describe, it, expect } from 'vitest'
import { computeDeviations, needsRebalancing, rebalancingRecommended } from '../deviation-service'
import type { AllocationRule, Portfolio, DeviationThresholds } from '../../domain/models'

const RULES: AllocationRule[] = [
  { id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 60 },
  { id: '2', dimension: 'asset_class', category: 'Облигации', targetPercent: 30 },
  { id: '3', dimension: 'asset_class', category: 'Денежные средства', targetPercent: 10 },
]

function makePortfolio(positions: { assetClass: string; value: number }[]): Portfolio {
  return {
    userId: 'user-1',
    positions: positions.map((p, i) => ({
      ticker: `T${i}`,
      name: `Position ${i}`,
      assetClass: p.assetClass,
      sector: 'N/A',
      currentValue: p.value,
    })),
    totalValue: positions.reduce((sum, p) => sum + p.value, 0),
  }
}

describe('computeDeviations', () => {
  it('computes correct deviations for balanced portfolio', () => {
    const portfolio = makePortfolio([
      { assetClass: 'Акции', value: 60000 },
      { assetClass: 'Облигации', value: 30000 },
      { assetClass: 'Денежные средства', value: 10000 },
    ])

    const deviations = computeDeviations(RULES, portfolio)
    expect(deviations).toHaveLength(3)

    for (const d of deviations) {
      expect(d.deviationPercent).toBe(0)
      expect(d.severity).toBe('ok')
    }
  })

  it('detects overweight and underweight categories', () => {
    const portfolio = makePortfolio([
      { assetClass: 'Акции', value: 75000 },
      { assetClass: 'Облигации', value: 20000 },
      { assetClass: 'Денежные средства', value: 5000 },
    ])

    const deviations = computeDeviations(RULES, portfolio)
    const stocks = deviations.find(d => d.category === 'Акции')!
    const bonds = deviations.find(d => d.category === 'Облигации')!

    expect(stocks.deviationPercent).toBe(15) // 75 - 60
    expect(bonds.deviationPercent).toBe(-10) // 20 - 30
  })

  it('classifies severity based on thresholds', () => {
    const portfolio = makePortfolio([
      { assetClass: 'Акции', value: 85000 },
      { assetClass: 'Облигации', value: 10000 },
      { assetClass: 'Денежные средства', value: 5000 },
    ])

    const deviations = computeDeviations(RULES, portfolio)
    const stocks = deviations.find(d => d.category === 'Акции')!
    const bonds = deviations.find(d => d.category === 'Облигации')!

    expect(stocks.severity).toBe('critical') // +25%
    expect(bonds.severity).toBe('critical') // -20%
  })

  it('uses custom thresholds', () => {
    const portfolio = makePortfolio([
      { assetClass: 'Акции', value: 66000 },
      { assetClass: 'Облигации', value: 24000 },
      { assetClass: 'Денежные средства', value: 10000 },
    ])

    const thresholds: DeviationThresholds = { warningPercent: 5, criticalPercent: 10 }
    const deviations = computeDeviations(RULES, portfolio, thresholds)
    const bonds = deviations.find(d => d.category === 'Облигации')!

    expect(bonds.severity).toBe('warning') // -6% with 5% threshold
  })

  it('handles empty portfolio', () => {
    const portfolio: Portfolio = { userId: 'user-1', positions: [], totalValue: 0 }
    const deviations = computeDeviations(RULES, portfolio)

    expect(deviations).toHaveLength(3)
    for (const d of deviations) {
      expect(d.currentPercent).toBe(0)
    }
  })
})

describe('needsRebalancing', () => {
  it('returns true when critical deviations exist', () => {
    const deviations = computeDeviations(RULES, makePortfolio([
      { assetClass: 'Акции', value: 85000 },
      { assetClass: 'Облигации', value: 10000 },
      { assetClass: 'Денежные средства', value: 5000 },
    ]))
    expect(needsRebalancing(deviations)).toBe(true)
  })

  it('returns false when no critical deviations', () => {
    const deviations = computeDeviations(RULES, makePortfolio([
      { assetClass: 'Акции', value: 60000 },
      { assetClass: 'Облигации', value: 30000 },
      { assetClass: 'Денежные средства', value: 10000 },
    ]))
    expect(needsRebalancing(deviations)).toBe(false)
  })
})

describe('rebalancingRecommended', () => {
  it('returns true when warning deviations exist', () => {
    const portfolio = makePortfolio([
      { assetClass: 'Акции', value: 72000 },
      { assetClass: 'Облигации', value: 20000 },
      { assetClass: 'Денежные средства', value: 8000 },
    ])
    const deviations = computeDeviations(RULES, portfolio)
    expect(rebalancingRecommended(deviations)).toBe(true)
  })

  it('returns false when portfolio is balanced', () => {
    const deviations = computeDeviations(RULES, makePortfolio([
      { assetClass: 'Акции', value: 60000 },
      { assetClass: 'Облигации', value: 30000 },
      { assetClass: 'Денежные средства', value: 10000 },
    ]))
    expect(rebalancingRecommended(deviations)).toBe(false)
  })
})
