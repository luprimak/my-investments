import { describe, it, expect } from 'vitest'
import { formatRub, formatPercent, gainClass, assetClassLabel, brokerLabel, accountTypeLabel } from '../formatters'

describe('formatRub', () => {
  it('formats positive values with RUB symbol', () => {
    const result = formatRub(29550)
    expect(result).toContain('29')
    expect(result).toContain('550')
  })

  it('formats zero', () => {
    const result = formatRub(0)
    expect(result).toContain('0')
  })

  it('formats negative values', () => {
    const result = formatRub(-4000)
    expect(result).toContain('4')
    expect(result).toContain('000')
  })
})

describe('formatPercent', () => {
  it('adds plus sign for positive values', () => {
    expect(formatPercent(12.5)).toBe('+12.50%')
  })

  it('shows negative sign for negative values', () => {
    expect(formatPercent(-3.14)).toBe('-3.14%')
  })

  it('shows zero without sign', () => {
    expect(formatPercent(0)).toBe('0.00%')
  })
})

describe('gainClass', () => {
  it('returns gain-positive for positive', () => {
    expect(gainClass(100)).toBe('gain-positive')
  })

  it('returns gain-negative for negative', () => {
    expect(gainClass(-50)).toBe('gain-negative')
  })

  it('returns gain-neutral for zero', () => {
    expect(gainClass(0)).toBe('gain-neutral')
  })
})

describe('assetClassLabel', () => {
  it('returns Russian labels for all asset classes', () => {
    expect(assetClassLabel('stock')).toBe('Акции')
    expect(assetClassLabel('bond')).toBe('Облигации')
    expect(assetClassLabel('etf')).toBe('ETF')
    expect(assetClassLabel('currency')).toBe('Валюта')
    expect(assetClassLabel('other')).toBe('Прочее')
  })
})

describe('brokerLabel', () => {
  it('returns display names for all brokers', () => {
    expect(brokerLabel('sberbank')).toBe('Сбербанк Инвестиции')
    expect(brokerLabel('alfa')).toBe('Альфа-Инвестиции')
    expect(brokerLabel('tbank')).toBe('Т-Инвестиции')
    expect(brokerLabel('vtb')).toBe('ВТБ Мои Инвестиции')
  })
})

describe('accountTypeLabel', () => {
  it('returns Russian labels for account types', () => {
    expect(accountTypeLabel('standard')).toBe('Брокерский счёт')
    expect(accountTypeLabel('iis')).toBe('ИИС')
    expect(accountTypeLabel('trust_management')).toBe('ПДС (доверительное управление)')
    expect(accountTypeLabel('auto_managed')).toBe('Инвест-копилка')
  })
})
