import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrokerPage } from '../BrokerPage'

describe('BrokerPage', () => {
  it('renders page title', () => {
    render(<BrokerPage />)
    expect(screen.getByText('Брокерские счета')).toBeTruthy()
  })

  it('renders summary cards', () => {
    render(<BrokerPage />)
    expect(screen.getByText('Общая стоимость')).toBeTruthy()
    expect(screen.getByText('Доход / Убыток')).toBeTruthy()
    expect(screen.getByText('Позиций')).toBeTruthy()
    expect(screen.getByText('Брокеров')).toBeTruthy()
  })

  it('renders view toggle buttons', () => {
    render(<BrokerPage />)
    expect(screen.getByText('Обзор')).toBeTruthy()
    expect(screen.getByText('Позиции')).toBeTruthy()
    expect(screen.getByText('Операции')).toBeTruthy()
  })

  it('shows broker connections in overview', () => {
    render(<BrokerPage />)
    expect(screen.getByText('Подключённые брокеры')).toBeTruthy()
    expect(screen.getByText('Мой Т-Банк')).toBeTruthy()
    expect(screen.getByText('Сбер ИИС')).toBeTruthy()
    expect(screen.getByText('Альфа Брокер')).toBeTruthy()
    expect(screen.getByText('ВТБ Инвестиции')).toBeTruthy()
  })

  it('switches to positions view', () => {
    render(<BrokerPage />)
    fireEvent.click(screen.getByText('Позиции'))
    expect(screen.getByText('Консолидированный портфель')).toBeTruthy()
  })

  it('shows consolidated positions with tickers', () => {
    render(<BrokerPage />)
    fireEvent.click(screen.getByText('Позиции'))
    expect(screen.getByText('SBER')).toBeTruthy()
    expect(screen.getByText('GAZP')).toBeTruthy()
  })

  it('switches to transactions view', () => {
    render(<BrokerPage />)
    fireEvent.click(screen.getByText('Операции'))
    expect(screen.getByText('История операций')).toBeTruthy()
  })

  it('shows transaction types', () => {
    render(<BrokerPage />)
    fireEvent.click(screen.getByText('Операции'))
    expect(screen.getByText('Покупка МосБиржа 20 лот')).toBeTruthy()
    expect(screen.getByText('Дивиденды Сбербанк')).toBeTruthy()
  })
})
