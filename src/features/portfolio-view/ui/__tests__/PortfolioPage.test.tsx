import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PortfolioPage } from '../PortfolioPage'

describe('PortfolioPage', () => {
  it('renders the page title', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Портфель')).toBeInTheDocument()
  })

  it('renders summary cards', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Общая стоимость')).toBeInTheDocument()
    expect(screen.getByText('Позиций')).toBeInTheDocument()
    expect(screen.getByText('Брокеров')).toBeInTheDocument()
  })

  it('renders navigation tabs', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Обзор')).toBeInTheDocument()
    expect(screen.getByText('Все позиции')).toBeInTheDocument()
    expect(screen.getByText('По брокерам')).toBeInTheDocument()
  })

  it('shows allocation charts on summary tab by default', () => {
    render(<PortfolioPage />)
    expect(screen.getByText('Распределение по классам активов')).toBeInTheDocument()
    expect(screen.getByText('Распределение по секторам')).toBeInTheDocument()
  })

  it('switches to holdings view', () => {
    render(<PortfolioPage />)
    fireEvent.click(screen.getByText('Все позиции'))
    expect(screen.getByText('Тикер')).toBeInTheDocument()
    expect(screen.getByText('SBER')).toBeInTheDocument()
  })

  it('switches to broker view', () => {
    render(<PortfolioPage />)
    fireEvent.click(screen.getByText('По брокерам'))
    expect(screen.getByText('Сбербанк Инвестиции')).toBeInTheDocument()
    expect(screen.getByText('Т-Инвестиции')).toBeInTheDocument()
  })
})
