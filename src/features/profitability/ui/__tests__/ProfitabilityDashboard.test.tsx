import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfitabilityDashboard } from '../ProfitabilityDashboard'

describe('ProfitabilityDashboard', () => {
  it('renders the page title', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('Доходность портфеля')).toBeInTheDocument()
  })

  it('renders period selector with all periods', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('День')).toBeInTheDocument()
    expect(screen.getByText('Неделя')).toBeInTheDocument()
    expect(screen.getByText('Месяц')).toBeInTheDocument()
    expect(screen.getByText('Год')).toBeInTheDocument()
    expect(screen.getByText('Всё время')).toBeInTheDocument()
  })

  it('renders portfolio summary cards', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('Текущая стоимость')).toBeInTheDocument()
    expect(screen.getByText(/Доходность/)).toBeInTheDocument()
    expect(screen.getByText('Дивиденды и купоны')).toBeInTheDocument()
    expect(screen.getByText('Комиссии')).toBeInTheDocument()
  })

  it('renders best and worst performers sections', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('Лучшие позиции')).toBeInTheDocument()
    expect(screen.getByText('Худшие позиции')).toBeInTheDocument()
  })

  it('renders position returns table', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('Доходность по позициям')).toBeInTheDocument()
    expect(screen.getByText('SBER')).toBeInTheDocument()
  })

  it('renders return chart', () => {
    render(<ProfitabilityDashboard />)
    expect(screen.getByText('Доходность по позициям (%)')).toBeInTheDocument()
  })

  it('switches period when period button clicked', () => {
    render(<ProfitabilityDashboard />)
    const dayBtn = screen.getByText('День')
    fireEvent.click(dayBtn)
    // After clicking, the button should become active (re-renders with new data)
    expect(dayBtn.className).toContain('active')
  })
})
