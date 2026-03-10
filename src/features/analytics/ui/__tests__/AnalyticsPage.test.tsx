import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnalyticsPage } from '../AnalyticsPage'

describe('AnalyticsPage', () => {
  it('renders page title', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Аналитика')).toBeTruthy()
  })

  it('renders tab navigation', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Обзор')).toBeTruthy()
    expect(screen.getByText('Графики')).toBeTruthy()
    expect(screen.getByText('Метрики')).toBeTruthy()
    expect(screen.getByText('Отчёты')).toBeTruthy()
    expect(screen.getByText('Налоги')).toBeTruthy()
  })

  it('renders period selector', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('1М')).toBeTruthy()
    expect(screen.getByText('3М')).toBeTruthy()
    expect(screen.getByText('1Г')).toBeTruthy()
    expect(screen.getByText('Всё')).toBeTruthy()
  })

  it('renders overview cards by default', () => {
    render(<AnalyticsPage />)
    expect(screen.getByText('Стоимость портфеля')).toBeTruthy()
    expect(screen.getByText('Доходность')).toBeTruthy()
    expect(screen.getByText('Волатильность')).toBeTruthy()
    expect(screen.getByText('Коэфф. Шарпа')).toBeTruthy()
  })

  it('switches to charts tab', () => {
    render(<AnalyticsPage />)
    fireEvent.click(screen.getByText('Графики'))
    expect(screen.getByText('Стоимость портфеля')).toBeTruthy()
    expect(screen.getByText('Сравнение с бенчмарком')).toBeTruthy()
  })

  it('switches to metrics tab', () => {
    render(<AnalyticsPage />)
    fireEvent.click(screen.getByText('Метрики'))
    expect(screen.getByText('Метрики риска')).toBeTruthy()
  })

  it('switches to reports tab', () => {
    render(<AnalyticsPage />)
    fireEvent.click(screen.getByText('Отчёты'))
    expect(screen.getByText('Генератор отчётов')).toBeTruthy()
  })

  it('switches to tax tab', () => {
    render(<AnalyticsPage />)
    fireEvent.click(screen.getByText('Налоги'))
    expect(screen.getByText('Налоговая сводка — 2025 год')).toBeTruthy()
    expect(screen.getByText('История операций')).toBeTruthy()
  })
})
