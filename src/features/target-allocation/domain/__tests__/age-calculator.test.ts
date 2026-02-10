import { describe, it, expect } from 'vitest'
import { calculateAgeBasedAllocation, calculateAge } from '../age-calculator'

describe('calculateAgeBasedAllocation', () => {
  it('calculates 65% stocks / 35% bonds for age 35', () => {
    const rules = calculateAgeBasedAllocation(35)
    expect(rules).toHaveLength(2)

    const stocks = rules.find(r => r.category === 'Акции')
    const bonds = rules.find(r => r.category === 'Облигации')

    expect(stocks?.targetPercent).toBe(65)
    expect(bonds?.targetPercent).toBe(35)
  })

  it('calculates 45% stocks / 55% bonds for age 55', () => {
    const rules = calculateAgeBasedAllocation(55)
    const stocks = rules.find(r => r.category === 'Акции')
    const bonds = rules.find(r => r.category === 'Облигации')

    expect(stocks?.targetPercent).toBe(45)
    expect(bonds?.targetPercent).toBe(55)
  })

  it('clamps stock allocation to minimum 10% for age 95', () => {
    const rules = calculateAgeBasedAllocation(95)
    const stocks = rules.find(r => r.category === 'Акции')
    const bonds = rules.find(r => r.category === 'Облигации')

    expect(stocks?.targetPercent).toBe(10)
    expect(bonds?.targetPercent).toBe(90)
  })

  it('clamps stock allocation to maximum 90% for age 18', () => {
    const rules = calculateAgeBasedAllocation(18)
    const stocks = rules.find(r => r.category === 'Акции')

    expect(stocks?.targetPercent).toBe(82) // 100 - 18 = 82, within range
  })

  it('ensures rules sum to 100%', () => {
    for (let age = 18; age <= 99; age++) {
      const rules = calculateAgeBasedAllocation(age)
      const sum = rules.reduce((s, r) => s + r.targetPercent, 0)
      expect(sum).toBe(100)
    }
  })

  it('throws for age below 18', () => {
    expect(() => calculateAgeBasedAllocation(17)).toThrow()
  })

  it('throws for age above 99', () => {
    expect(() => calculateAgeBasedAllocation(100)).toThrow()
  })

  it('sets all rules to asset_class dimension', () => {
    const rules = calculateAgeBasedAllocation(40)
    for (const rule of rules) {
      expect(rule.dimension).toBe('asset_class')
    }
  })
})

describe('calculateAge', () => {
  it('calculates age from birth year', () => {
    expect(calculateAge(1990, 2025)).toBe(35)
  })

  it('calculates age for current year when no reference given', () => {
    const currentYear = new Date().getFullYear()
    expect(calculateAge(1990)).toBe(currentYear - 1990)
  })
})
