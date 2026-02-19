import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReportBuilder } from '../ReportBuilder'
import type { GeneratedReport, RiskMetrics } from '../../domain/models'

describe('ReportBuilder', () => {
  const mockMetrics: RiskMetrics = {
    volatility: 15, sharpeRatio: 0.8, maxDrawdown: 10,
    maxDrawdownPeriod: { peakDate: '2025-01-01', troughDate: '2025-02-01' },
  }

  const mockReport: GeneratedReport = {
    config: { periodType: 'yearly', year: 2025, includeCharts: true, includeTaxBreakdown: true, includeTransactions: true },
    generatedAt: new Date().toISOString(),
    metrics: mockMetrics,
    allocation: [{ category: 'Акции', value: 100000, percent: 70, color: '#1976d2' }],
    portfolioReturn: 12.5,
  }

  it('renders title', () => {
    render(<ReportBuilder onGenerate={() => null} />)
    expect(screen.getByText('Генератор отчётов')).toBeTruthy()
  })

  it('renders period type buttons', () => {
    render(<ReportBuilder onGenerate={() => null} />)
    expect(screen.getByText('Месяц')).toBeTruthy()
    expect(screen.getByText('Квартал')).toBeTruthy()
    expect(screen.getByText('Год')).toBeTruthy()
  })

  it('renders generate button', () => {
    render(<ReportBuilder onGenerate={() => null} />)
    expect(screen.getByText('Сгенерировать отчёт')).toBeTruthy()
  })

  it('calls onGenerate when button clicked', () => {
    const onGenerate = vi.fn().mockReturnValue(mockReport)
    render(<ReportBuilder onGenerate={onGenerate} />)
    fireEvent.click(screen.getByText('Сгенерировать отчёт'))
    expect(onGenerate).toHaveBeenCalled()
  })

  it('shows report preview after generation', () => {
    const onGenerate = vi.fn().mockReturnValue(mockReport)
    render(<ReportBuilder onGenerate={onGenerate} />)
    fireEvent.click(screen.getByText('Сгенерировать отчёт'))
    expect(screen.getByText('Скачать CSV')).toBeTruthy()
    expect(screen.getByText('Печать / PDF')).toBeTruthy()
  })

  it('shows month selector for monthly period', () => {
    render(<ReportBuilder onGenerate={() => null} />)
    fireEvent.click(screen.getByText('Месяц'))
    expect(screen.getByText('Январь')).toBeTruthy()
  })

  it('shows quarter selector for quarterly period', () => {
    render(<ReportBuilder onGenerate={() => null} />)
    fireEvent.click(screen.getByText('Квартал'))
    expect(screen.getByText('I квартал')).toBeTruthy()
  })
})
