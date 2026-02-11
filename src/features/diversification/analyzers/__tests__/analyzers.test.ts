import { describe, it, expect } from 'vitest'
import { IssuerAnalyzer } from '../issuer-analyzer'
import { SectorAnalyzer } from '../sector-analyzer'
import { AssetClassAnalyzer } from '../asset-class-analyzer'
import { GeographyAnalyzer } from '../geography-analyzer'
import { CurrencyAnalyzer } from '../currency-analyzer'
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

function makePortfolio(positions: PortfolioPosition[]): Portfolio {
  return {
    userId: 'u1',
    positions,
    totalValue: positions.reduce((sum, p) => sum + p.currentValue, 0),
  }
}

describe('IssuerAnalyzer', () => {
  it('detects single-issuer concentration', () => {
    const portfolio = makePortfolio([
      makePos({ ticker: 'SBER', currentValue: 400000 }),
      makePos({ ticker: 'GAZP', currentValue: 100000 }),
    ])

    const result = new IssuerAnalyzer().analyze(portfolio)

    expect(result.dimension).toBe('issuer')
    expect(result.distribution).toHaveLength(2)
    expect(result.distribution[0]!.category).toBe('SBER')
    expect(result.distribution[0]!.currentPercent).toBe(80)

    // 80% > 30% threshold → should have warning
    const sberWarning = result.warnings.find(w => w.category === 'SBER')
    expect(sberWarning).toBeDefined()
  })

  it('warns about low position count', () => {
    const portfolio = makePortfolio([
      makePos({ ticker: 'SBER', currentValue: 500000 }),
      makePos({ ticker: 'GAZP', currentValue: 500000 }),
    ])

    const result = new IssuerAnalyzer().analyze(portfolio)
    const countWarning = result.warnings.find(w => w.category === 'Количество позиций')
    expect(countWarning).toBeDefined()
  })

  it('returns high score for well-diversified portfolio', () => {
    const positions = Array.from({ length: 20 }, (_, i) =>
      makePos({ ticker: `T${i}`, currentValue: 50000 }),
    )
    const portfolio = makePortfolio(positions)

    const result = new IssuerAnalyzer().analyze(portfolio)
    expect(result.score).toBeGreaterThan(70)
  })
})

describe('SectorAnalyzer', () => {
  it('detects sector concentration', () => {
    const portfolio = makePortfolio([
      makePos({ ticker: 'SBER', sector: 'Финансовый', currentValue: 600000 }),
      makePos({ ticker: 'GAZP', sector: 'Нефть и газ', currentValue: 400000 }),
    ])

    const result = new SectorAnalyzer().analyze(portfolio)
    expect(result.dimension).toBe('sector')

    // 60% > 50% threshold → should warn
    const finWarning = result.warnings.find(w => w.category === 'Финансовый')
    expect(finWarning).toBeDefined()
  })

  it('warns about too few sectors', () => {
    const portfolio = makePortfolio([
      makePos({ ticker: 'S1', sector: 'Финансовый', currentValue: 100000 }),
      makePos({ ticker: 'S2', sector: 'Финансовый', currentValue: 100000 }),
      makePos({ ticker: 'S3', sector: 'Финансовый', currentValue: 100000 }),
      makePos({ ticker: 'S4', sector: 'Финансовый', currentValue: 100000 }),
    ])

    const result = new SectorAnalyzer().analyze(portfolio)
    const sectorCountWarning = result.warnings.find(w => w.category === 'Секторы')
    expect(sectorCountWarning).toBeDefined()
  })
})

describe('AssetClassAnalyzer', () => {
  it('detects asset class concentration', () => {
    const portfolio = makePortfolio([
      makePos({ assetClass: 'Акции', currentValue: 900000 }),
      makePos({ assetClass: 'Облигации', currentValue: 100000, ticker: 'OFZ' }),
    ])

    const result = new AssetClassAnalyzer().analyze(portfolio)
    expect(result.dimension).toBe('asset_class')

    // 90% > 70% threshold
    const warning = result.warnings.find(w => w.category === 'Акции')
    expect(warning).toBeDefined()
  })
})

describe('GeographyAnalyzer', () => {
  it('handles single-geography portfolio', () => {
    const portfolio = makePortfolio([
      makePos({ geography: 'Россия', currentValue: 500000 }),
      makePos({ geography: 'Россия', currentValue: 500000, ticker: 'G2' }),
    ])

    const result = new GeographyAnalyzer().analyze(portfolio)
    expect(result.dimension).toBe('geography')
    expect(result.distribution).toHaveLength(1)
    expect(result.concentrationIndex).toBe(1)
  })
})

describe('CurrencyAnalyzer', () => {
  it('handles single-currency portfolio', () => {
    const portfolio = makePortfolio([
      makePos({ currency: 'RUB', currentValue: 500000 }),
      makePos({ currency: 'RUB', currentValue: 500000, ticker: 'C2' }),
    ])

    const result = new CurrencyAnalyzer().analyze(portfolio)
    expect(result.dimension).toBe('currency')
    expect(result.distribution).toHaveLength(1)
  })

  it('recognizes multi-currency diversification', () => {
    const portfolio = makePortfolio([
      makePos({ currency: 'RUB', currentValue: 500000 }),
      makePos({ currency: 'USD', currentValue: 300000, ticker: 'C2' }),
      makePos({ currency: 'EUR', currentValue: 200000, ticker: 'C3' }),
    ])

    const result = new CurrencyAnalyzer().analyze(portfolio)
    expect(result.distribution).toHaveLength(3)
    expect(result.concentrationIndex).toBeLessThan(0.5)
  })
})
