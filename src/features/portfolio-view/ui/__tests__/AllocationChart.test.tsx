import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllocationChart } from '../AllocationChart'

describe('AllocationChart', () => {
  it('renders title and legend', () => {
    const data = [
      { category: 'Акции', percent: 60, value: 180000 },
      { category: 'Облигации', percent: 40, value: 120000 },
    ]
    render(<AllocationChart data={data} title="Распределение" />)
    expect(screen.getByText('Распределение')).toBeInTheDocument()
    expect(screen.getByText('Акции')).toBeInTheDocument()
    expect(screen.getByText('Облигации')).toBeInTheDocument()
  })

  it('shows percentage in segments when large enough', () => {
    const data = [
      { category: 'Акции', percent: 60, value: 180000 },
      { category: 'Облигации', percent: 40, value: 120000 },
    ]
    render(<AllocationChart data={data} title="Test" />)
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
  })

  it('renders nothing when data is empty', () => {
    const { container } = render(<AllocationChart data={[]} title="Test" />)
    expect(container.innerHTML).toBe('')
  })
})
