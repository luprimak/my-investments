import { describe, it, expect } from 'vitest'
import { formatWeight, formatRate, changeClass, todayISO } from '../formatters'

describe('formatWeight', () => {
  it('formats weight with one decimal and unit', () => {
    expect(formatWeight(85)).toBe('85.0 кг')
    expect(formatWeight(77.5)).toBe('77.5 кг')
    expect(formatWeight(95.12)).toBe('95.1 кг')
  })
})

describe('formatRate', () => {
  it('formats negative rate (weight loss)', () => {
    expect(formatRate(-0.5)).toBe('-0.50 кг/нед')
  })

  it('formats positive rate (weight gain)', () => {
    expect(formatRate(0.3)).toBe('+0.30 кг/нед')
  })

  it('formats zero rate', () => {
    expect(formatRate(0)).toBe('0.00 кг/нед')
  })
})

describe('changeClass', () => {
  it('returns change-good for negative (losing weight)', () => {
    expect(changeClass(-1)).toBe('change-good')
  })

  it('returns change-bad for positive (gaining weight)', () => {
    expect(changeClass(1)).toBe('change-bad')
  })

  it('returns change-neutral for zero', () => {
    expect(changeClass(0)).toBe('change-neutral')
  })
})

describe('todayISO', () => {
  it('returns ISO date string in YYYY-MM-DD format', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
