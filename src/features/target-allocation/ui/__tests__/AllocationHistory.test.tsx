import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllocationHistory } from '../AllocationHistory'
import type { AllocationHistoryEntry } from '../../domain/models'

describe('AllocationHistory', () => {
  it('shows empty state when no entries', () => {
    render(<AllocationHistory entries={[]} />)
    expect(screen.getByText(/Изменений пока не было/)).toBeInTheDocument()
  })

  it('renders history entries', () => {
    const entries: AllocationHistoryEntry[] = [
      {
        id: '1',
        userId: 'user-1',
        allocationId: 'alloc-1',
        changedAt: '2025-06-20T12:00:00Z',
        reason: 'Переход на умеренную',
        previousSnapshot: {
          id: 'alloc-1',
          userId: 'user-1',
          name: 'Агрессивная',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          isActive: false,
          source: 'template',
          rules: [
            { id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 85 },
            { id: '2', dimension: 'asset_class', category: 'Облигации', targetPercent: 15 },
          ],
          constraints: [],
        },
      },
    ]

    render(<AllocationHistory entries={entries} />)

    expect(screen.getByText('Агрессивная')).toBeInTheDocument()
    expect(screen.getByText(/Переход на умеренную/)).toBeInTheDocument()
    expect(screen.getByText('Акции: 85%')).toBeInTheDocument()
  })
})
