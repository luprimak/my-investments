import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DeviationDashboard } from '../DeviationDashboard'
import type { Deviation } from '../../domain/models'

describe('DeviationDashboard', () => {
  it('shows empty state when no deviations', () => {
    render(<DeviationDashboard deviations={[]} />)
    expect(screen.getByText(/Нет данных для анализа/)).toBeInTheDocument()
  })

  it('renders deviation table with data', () => {
    const deviations: Deviation[] = [
      {
        category: 'Акции',
        dimension: 'asset_class',
        targetPercent: 60,
        currentPercent: 75,
        deviationPercent: 15,
        severity: 'critical',
      },
      {
        category: 'Облигации',
        dimension: 'asset_class',
        targetPercent: 30,
        currentPercent: 20,
        deviationPercent: -10,
        severity: 'warning',
      },
    ]

    render(<DeviationDashboard deviations={deviations} />)

    expect(screen.getByText('Акции')).toBeInTheDocument()
    expect(screen.getByText('Облигации')).toBeInTheDocument()
    expect(screen.getByText('+15%')).toBeInTheDocument()
    expect(screen.getByText('-10%')).toBeInTheDocument()
  })

  it('shows critical rebalancing status', () => {
    const deviations: Deviation[] = [
      {
        category: 'Акции',
        dimension: 'asset_class',
        targetPercent: 60,
        currentPercent: 85,
        deviationPercent: 25,
        severity: 'critical',
      },
    ]

    render(<DeviationDashboard deviations={deviations} />)
    expect(screen.getByText(/Требуется ребалансировка/)).toBeInTheDocument()
  })

  it('shows balanced status when all deviations are ok', () => {
    const deviations: Deviation[] = [
      {
        category: 'Акции',
        dimension: 'asset_class',
        targetPercent: 60,
        currentPercent: 62,
        deviationPercent: 2,
        severity: 'ok',
      },
    ]

    render(<DeviationDashboard deviations={deviations} />)
    expect(screen.getByText(/Портфель сбалансирован/)).toBeInTheDocument()
  })
})
