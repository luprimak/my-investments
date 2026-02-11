import { describe, it, expect } from 'vitest'
import { generateReport, generateAggregatedReport } from '../diversification-service'
import type { Portfolio, PortfolioPosition } from '../../domain/models'

function makePos(overrides: Partial<PortfolioPosition> = {}): PortfolioPosition {
  return {
    ticker: 'SBER',
    name: 'Сбербанк',
    broker: 'Сбербанк',
    assetClass: 'Акции',
    sector: 'Финансовый',
    currency: 'RUB',
    geography: 'Россия',
    currentValue: 100000,
    ...overrides,
  }
}

describe('generateReport', () => {
  it('generates a complete report with all dimensions', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePos({ ticker: 'SBER', sector: 'Финансовый', currentValue: 300000 }),
        makePos({ ticker: 'GAZP', sector: 'Нефть и газ', currentValue: 200000 }),
        makePos({ ticker: 'YNDX', sector: 'IT', currentValue: 150000 }),
        makePos({ ticker: 'GMKN', sector: 'Металлургия', currentValue: 150000 }),
        makePos({ ticker: 'OFZ', assetClass: 'Облигации', sector: 'Гос. облигации', currentValue: 200000 }),
      ],
      totalValue: 1_000_000,
    }

    const report = generateReport(portfolio)

    expect(report.userId).toBe('u1')
    expect(report.dimensions).toHaveLength(5) // all 5 analyzers
    expect(report.overallScore).toBeGreaterThan(0)
    expect(report.overallScore).toBeLessThanOrEqual(100)
    expect(['poor', 'fair', 'good', 'excellent']).toContain(report.overallRating)
    expect(report.herfindahlIndex).toBeGreaterThan(0)
    expect(report.generatedAt).toBeDefined()
  })

  it('produces warnings for concentrated portfolios', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePos({ ticker: 'SBER', currentValue: 800000 }),
        makePos({ ticker: 'GAZP', currentValue: 200000 }),
      ],
      totalValue: 1_000_000,
    }

    const report = generateReport(portfolio)
    const allWarnings = report.dimensions.flatMap(d => d.warnings)
    expect(allWarnings.length).toBeGreaterThan(0)
    expect(report.recommendations.length).toBeGreaterThan(0)
  })

  it('gives high score for well-diversified portfolio', () => {
    const sectors = ['Финансовый', 'Нефть и газ', 'IT', 'Металлургия', 'Потребительский']
    const positions = Array.from({ length: 20 }, (_, i) =>
      makePos({
        ticker: `T${i}`,
        sector: sectors[i % sectors.length]!,
        currentValue: 50000,
      }),
    )

    const portfolio: Portfolio = {
      userId: 'u1',
      positions,
      totalValue: 1_000_000,
    }

    const report = generateReport(portfolio)
    expect(report.overallScore).toBeGreaterThan(60)
  })

  it('limits recommendations to 7 or fewer', () => {
    const portfolio: Portfolio = {
      userId: 'u1',
      positions: [
        makePos({ ticker: 'SBER', currentValue: 900000 }),
        makePos({ ticker: 'GAZP', currentValue: 100000 }),
      ],
      totalValue: 1_000_000,
    }

    const report = generateReport(portfolio)
    expect(report.recommendations.length).toBeLessThanOrEqual(7)
  })
})

describe('generateAggregatedReport', () => {
  it('merges positions from multiple portfolios', () => {
    const p1: Portfolio = {
      userId: 'u1',
      positions: [makePos({ ticker: 'SBER', currentValue: 500000 })],
      totalValue: 500000,
    }
    const p2: Portfolio = {
      userId: 'u1',
      positions: [makePos({ ticker: 'GAZP', sector: 'Нефть и газ', currentValue: 500000 })],
      totalValue: 500000,
    }

    const report = generateAggregatedReport([p1, p2])
    expect(report.herfindahlIndex).toBeCloseTo(0.5, 1)
  })
})
