import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarketDataPage } from '../MarketDataPage'

describe('MarketDataPage', () => {
  it('renders page title', () => {
    render(<MarketDataPage />)
    expect(screen.getByText('Рыночные данные MOEX')).toBeTruthy()
  })

  it('renders exchange rates', () => {
    render(<MarketDataPage />)
    expect(screen.getByText('USD/RUB')).toBeTruthy()
    expect(screen.getByText('EUR/RUB')).toBeTruthy()
    expect(screen.getByText('CNY/RUB')).toBeTruthy()
  })

  it('renders search input', () => {
    render(<MarketDataPage />)
    const input = screen.getByPlaceholderText('Поиск по тикеру или названию...')
    expect(input).toBeTruthy()
  })

  it('renders quote cards', () => {
    render(<MarketDataPage />)
    expect(screen.getByText('SBER')).toBeTruthy()
    expect(screen.getByText('GAZP')).toBeTruthy()
    expect(screen.getByText('LKOH')).toBeTruthy()
  })

  it('shows selection hint when no ticker selected', () => {
    render(<MarketDataPage />)
    expect(screen.getByText('Выберите инструмент для просмотра графика и деталей')).toBeTruthy()
  })

  it('shows chart when quote card is clicked', () => {
    render(<MarketDataPage />)

    const sberCard = screen.getByText('SBER').closest('.quote-card')!
    fireEvent.click(sberCard)

    expect(screen.getByText('Неделя')).toBeTruthy()
    expect(screen.getByText('Месяц')).toBeTruthy()
    expect(screen.getByText('3 мес')).toBeTruthy()
  })

  it('searches for securities', () => {
    render(<MarketDataPage />)

    const input = screen.getByPlaceholderText('Поиск по тикеру или названию...')
    fireEvent.change(input, { target: { value: 'Газпром' } })

    expect(screen.getAllByText(/GAZP/).length).toBeGreaterThan(0)
  })

  it('shows positive change in green', () => {
    render(<MarketDataPage />)
    const sberChange = screen.getByText(/\+3,25/)
    expect(sberChange.className).toContain('positive')
  })

  it('shows negative change in red', () => {
    render(<MarketDataPage />)
    const gazpChange = screen.getByText(/-1,80/)
    expect(gazpChange.className).toContain('negative')
  })
})
