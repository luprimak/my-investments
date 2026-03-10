import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskMetricsPanel } from '../RiskMetricsPanel'
import type { RiskMetrics } from '../../domain/models'

describe('RiskMetricsPanel', () => {
  const mockMetrics: RiskMetrics = {
    volatility: 18.5,
    sharpeRatio: 1.2,
    maxDrawdown: 12.3,
    maxDrawdownPeriod: {
      peakDate: '2025-03-15',
      troughDate: '2025-04-10',
    },
  }

  it('renders volatility', () => {
    render(<RiskMetricsPanel metrics={mockMetrics} />)
    expect(screen.getByText('Волатильность')).toBeTruthy()
    expect(screen.getByText('18.50%')).toBeTruthy()
  })

  it('renders Sharpe ratio', () => {
    render(<RiskMetricsPanel metrics={mockMetrics} />)
    expect(screen.getByText('Коэфф. Шарпа')).toBeTruthy()
    expect(screen.getByText('1.20')).toBeTruthy()
  })

  it('renders max drawdown with dates', () => {
    render(<RiskMetricsPanel metrics={mockMetrics} />)
    expect(screen.getByText('Макс. просадка')).toBeTruthy()
    expect(screen.getByText('12.30%')).toBeTruthy()
    expect(screen.getByText('15.03.2025 — 10.04.2025')).toBeTruthy()
  })

  it('shows quality rating for good Sharpe', () => {
    render(<RiskMetricsPanel metrics={mockMetrics} />)
    expect(screen.getByText('Хорошо')).toBeTruthy()
  })

  it('shows beta when provided', () => {
    const withBeta = { ...mockMetrics, beta: 0.85 }
    render(<RiskMetricsPanel metrics={withBeta} />)
    expect(screen.getByText('Бета')).toBeTruthy()
    expect(screen.getByText('0.85')).toBeTruthy()
  })
})
