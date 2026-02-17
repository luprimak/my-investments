import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrokerBreakdown } from '../BrokerBreakdown'
import type { BrokerAccount } from '../../domain/models'

const MOCK_ACCOUNTS: BrokerAccount[] = [
  {
    broker: 'sberbank', displayName: 'Сбербанк Инвестиции', accountType: 'standard',
    positions: [
      {
        ticker: 'SBER', name: 'Сбербанк', broker: 'sberbank', accountType: 'standard',
        assetClass: 'stock', sector: 'Финансы', currency: 'RUB',
        quantity: 100, currentPrice: 300, currentValue: 30000, costBasis: 25000,
        purchaseDate: '2024-01-01', dailyVolume: 1000000,
        unrealizedGain: 5000, unrealizedGainPercent: 20, portfolioWeight: 100,
      },
    ],
    totalValue: 30000, totalGain: 5000, positionCount: 1,
  },
  {
    broker: 'vtb', displayName: 'ВТБ Мои Инвестиции', accountType: 'auto_managed',
    positions: [
      {
        ticker: 'TBRU', name: 'Тинькофф Облигации', broker: 'vtb', accountType: 'auto_managed',
        assetClass: 'etf', sector: 'Облигации', currency: 'RUB',
        quantity: 1000, currentPrice: 5.5, currentValue: 5500, costBasis: 5000,
        purchaseDate: '2024-10-01', dailyVolume: 5000000,
        unrealizedGain: 500, unrealizedGainPercent: 10, portfolioWeight: 100,
      },
    ],
    totalValue: 5500, totalGain: 500, positionCount: 1,
  },
]

describe('BrokerBreakdown', () => {
  it('renders all broker accounts', () => {
    render(<BrokerBreakdown accounts={MOCK_ACCOUNTS} />)
    expect(screen.getByText('Сбербанк Инвестиции')).toBeInTheDocument()
    expect(screen.getByText('ВТБ Мои Инвестиции')).toBeInTheDocument()
  })

  it('shows account type badges', () => {
    render(<BrokerBreakdown accounts={MOCK_ACCOUNTS} />)
    expect(screen.getByText('Брокерский счёт')).toBeInTheDocument()
    expect(screen.getByText('Инвест-копилка')).toBeInTheDocument()
  })

  it('expands broker to show positions when clicked', () => {
    render(<BrokerBreakdown accounts={MOCK_ACCOUNTS} />)
    fireEvent.click(screen.getByText('Сбербанк Инвестиции'))
    expect(screen.getByText('SBER')).toBeInTheDocument()
    expect(screen.getByText('Сбербанк')).toBeInTheDocument()
  })

  it('shows empty state when no accounts', () => {
    render(<BrokerBreakdown accounts={[]} />)
    expect(screen.getByText('Нет подключённых брокеров.')).toBeInTheDocument()
  })
})
