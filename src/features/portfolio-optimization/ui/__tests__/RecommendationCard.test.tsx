import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecommendationCard } from '../RecommendationCard'
import type { Recommendation } from '../../domain/models'

function makeRec(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'rec-1',
    type: 'rebalance_trade',
    priority: 'high',
    title: 'Ребалансировка портфеля',
    reason: 'Обнаружено: 2 критических отклонений',
    impact: {
      estimatedCommission: 500,
      estimatedTax: 1300,
      totalCost: 1800,
      portfolioImprovement: 'Отклонение уменьшится с 15% до 2%',
    },
    actions: [
      { broker: 'Сбербанк', ticker: 'SBER', direction: 'sell', quantity: 50, estimatedPrice: 300, estimatedAmount: 15000 },
    ],
    status: 'pending',
    ...overrides,
  }
}

describe('RecommendationCard', () => {
  it('renders recommendation details', () => {
    render(
      <RecommendationCard recommendation={makeRec()} onAccept={() => {}} onDismiss={() => {}} />,
    )

    expect(screen.getByText('Ребалансировка портфеля')).toBeInTheDocument()
    expect(screen.getByText(/Обнаружено/)).toBeInTheDocument()
    expect(screen.getByText(/Отклонение уменьшится/)).toBeInTheDocument()
    expect(screen.getByText('Высокий')).toBeInTheDocument()
  })

  it('shows accept and dismiss buttons for pending recommendations', () => {
    render(
      <RecommendationCard recommendation={makeRec()} onAccept={() => {}} onDismiss={() => {}} />,
    )

    expect(screen.getByText('Принять')).toBeInTheDocument()
    expect(screen.getByText('Отклонить')).toBeInTheDocument()
  })

  it('calls onAccept when accept button is clicked', () => {
    const onAccept = vi.fn()
    render(
      <RecommendationCard recommendation={makeRec()} onAccept={onAccept} onDismiss={() => {}} />,
    )

    fireEvent.click(screen.getByText('Принять'))
    expect(onAccept).toHaveBeenCalledWith('rec-1')
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn()
    render(
      <RecommendationCard recommendation={makeRec()} onAccept={() => {}} onDismiss={onDismiss} />,
    )

    fireEvent.click(screen.getByText('Отклонить'))
    expect(onDismiss).toHaveBeenCalledWith('rec-1')
  })

  it('shows accepted badge for accepted recommendations', () => {
    render(
      <RecommendationCard
        recommendation={makeRec({ status: 'accepted' })}
        onAccept={() => {}}
        onDismiss={() => {}}
      />,
    )

    expect(screen.getByText('Принято')).toBeInTheDocument()
    expect(screen.queryByText('Принять')).not.toBeInTheDocument()
  })

  it('shows dismissed badge for dismissed recommendations', () => {
    render(
      <RecommendationCard
        recommendation={makeRec({ status: 'dismissed' })}
        onAccept={() => {}}
        onDismiss={() => {}}
      />,
    )

    expect(screen.getByText('Отклонено')).toBeInTheDocument()
  })

  it('displays trade actions', () => {
    render(
      <RecommendationCard recommendation={makeRec()} onAccept={() => {}} onDismiss={() => {}} />,
    )

    expect(screen.getByText(/Продать/)).toBeInTheDocument()
    expect(screen.getByText(/SBER/)).toBeInTheDocument()
  })
})
