import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HoldingsTable } from '../HoldingsTable'
import type { ViewPosition } from '../../domain/models'

const MOCK_POSITIONS: ViewPosition[] = [
  {
    ticker: 'SBER', name: 'Сбербанк', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', sector: 'Финансы', currency: 'RUB',
    quantity: 100, currentPrice: 300, currentValue: 30000, costBasis: 25000,
    purchaseDate: '2024-01-01', dailyVolume: 1000000,
    unrealizedGain: 5000, unrealizedGainPercent: 20, portfolioWeight: 60,
  },
  {
    ticker: 'GAZP', name: 'Газпром', broker: 'tbank', accountType: 'standard',
    assetClass: 'stock', sector: 'Нефть и газ', currency: 'RUB',
    quantity: 200, currentPrice: 150, currentValue: 30000, costBasis: 35000,
    purchaseDate: '2024-02-01', dailyVolume: 2000000,
    unrealizedGain: -5000, unrealizedGainPercent: -14.29, portfolioWeight: 40,
  },
]

describe('HoldingsTable', () => {
  it('renders all positions', () => {
    render(<HoldingsTable positions={MOCK_POSITIONS} />)
    expect(screen.getByText('SBER')).toBeInTheDocument()
    expect(screen.getByText('GAZP')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<HoldingsTable positions={MOCK_POSITIONS} />)
    expect(screen.getByText(/Тикер/)).toBeInTheDocument()
    expect(screen.getByText(/Название/)).toBeInTheDocument()
    expect(screen.getByText(/Стоимость/)).toBeInTheDocument()
  })

  it('shows empty state when no positions', () => {
    render(<HoldingsTable positions={[]} />)
    expect(screen.getByText('Нет позиций для отображения.')).toBeInTheDocument()
  })

  it('sorts by column when header is clicked', () => {
    render(<HoldingsTable positions={MOCK_POSITIONS} />)
    const tickerHeader = screen.getByText(/Тикер/)
    fireEvent.click(tickerHeader)
    // After clicking, sorting should be applied (visual check via sort indicator)
    expect(screen.getByText('▼')).toBeInTheDocument()
  })
})
