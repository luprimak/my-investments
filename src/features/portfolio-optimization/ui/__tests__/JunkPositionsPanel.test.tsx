import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { JunkPositionsPanel } from '../JunkPositionsPanel'
import type { JunkPositionReport } from '../../domain/models'

describe('JunkPositionsPanel', () => {
  it('shows empty state when no junk positions', () => {
    const report: JunkPositionReport = {
      positions: [],
      totalJunkValue: 0,
      percentOfPortfolio: 0,
    }

    render(<JunkPositionsPanel report={report} />)
    expect(screen.getByText(/Мусорных позиций не обнаружено/)).toBeInTheDocument()
  })

  it('renders junk positions table', () => {
    const report: JunkPositionReport = {
      positions: [
        {
          ticker: 'TINY',
          broker: 'Сбербанк',
          reason: 'small_position',
          currentValue: 2000,
          percentOfPortfolio: 0.4,
          details: 'Позиция слишком мала',
        },
        {
          ticker: 'LOSER',
          broker: 'Альфа',
          reason: 'deep_loss',
          currentValue: 5000,
          percentOfPortfolio: 1,
          details: 'Убыток -65%',
        },
      ],
      totalJunkValue: 7000,
      percentOfPortfolio: 1.4,
    }

    render(<JunkPositionsPanel report={report} />)

    expect(screen.getByText('TINY')).toBeInTheDocument()
    expect(screen.getByText('LOSER')).toBeInTheDocument()
    expect(screen.getByText('Мелкая позиция')).toBeInTheDocument()
    expect(screen.getByText('Глубокий убыток')).toBeInTheDocument()
    expect(screen.getByText(/7/)).toBeInTheDocument() // total value
  })
})
