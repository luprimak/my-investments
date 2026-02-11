import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DiversificationDashboard } from '../DiversificationDashboard'
import type { DiversificationReport } from '../../domain/models'

const MOCK_REPORT: DiversificationReport = {
  userId: 'u1',
  generatedAt: '2026-02-10T12:00:00Z',
  overallScore: 72,
  overallRating: 'good',
  dimensions: [
    {
      dimension: 'asset_class',
      score: 80,
      distribution: [
        { category: 'Акции', currentPercent: 60, positionCount: 5, totalValue: 600000 },
        { category: 'Облигации', currentPercent: 40, positionCount: 3, totalValue: 400000 },
      ],
      warnings: [],
      concentrationIndex: 0.52,
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      priority: 'medium',
      type: 'reduce_concentration',
      title: 'Снизьте долю SBER',
      description: 'SBER составляет 35% портфеля',
      affectedDimension: 'issuer',
      suggestedActions: [{ action: 'sell', ticker: 'SBER', name: 'SBER', reason: 'Сократить до 15%' }],
    },
  ],
  herfindahlIndex: 0.15,
}

describe('DiversificationDashboard', () => {
  it('shows empty state when no report', () => {
    render(<DiversificationDashboard report={null} onAnalyze={() => {}} />)
    expect(screen.getByText(/Нажмите.*Анализировать/)).toBeInTheDocument()
  })

  it('shows analyze button', () => {
    const onAnalyze = vi.fn()
    render(<DiversificationDashboard report={null} onAnalyze={onAnalyze} />)

    fireEvent.click(screen.getByText('Анализировать'))
    expect(onAnalyze).toHaveBeenCalled()
  })

  it('renders report with score and dimensions', () => {
    render(<DiversificationDashboard report={MOCK_REPORT} onAnalyze={() => {}} />)

    expect(screen.getByText('72')).toBeInTheDocument()
    expect(screen.getByText(/Хорошая диверсификация/)).toBeInTheDocument()
    expect(screen.getByText('Классы активов')).toBeInTheDocument()
    expect(screen.getByText('Акции')).toBeInTheDocument()
  })

  it('renders recommendations', () => {
    render(<DiversificationDashboard report={MOCK_REPORT} onAnalyze={() => {}} />)

    expect(screen.getByText('Снизьте долю SBER')).toBeInTheDocument()
  })
})
