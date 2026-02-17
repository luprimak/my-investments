import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortfolioSummary } from '../PortfolioSummary'
import type { PortfolioMetrics } from '../../domain/models'

const MOCK_METRICS: PortfolioMetrics = {
  totalValue: 330910,
  totalCostBasis: 300700,
  totalGain: 30210,
  totalGainPercent: 10.05,
  positionCount: 15,
  brokerCount: 4,
  allocationByAssetClass: [],
  allocationBySector: [],
  topHoldings: [],
}

describe('PortfolioSummary', () => {
  it('renders total value', () => {
    render(<PortfolioSummary metrics={MOCK_METRICS} />)
    expect(screen.getByText('Общая стоимость')).toBeInTheDocument()
  })

  it('renders position and broker counts', () => {
    render(<PortfolioSummary metrics={MOCK_METRICS} />)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders gain/loss label', () => {
    render(<PortfolioSummary metrics={MOCK_METRICS} />)
    expect(screen.getByText(/Прибыль\/Убыток/)).toBeInTheDocument()
  })
})
