import type { AllocationRule } from './models'

/**
 * Calculates target allocation based on the "100 minus age" rule.
 *
 * For a 35-year-old: stocks = 65%, bonds = 35%
 * For a 55-year-old: stocks = 45%, bonds = 55%
 *
 * Age must be between 18 and 99. Stock allocation is clamped to 10–90%.
 */
export function calculateAgeBasedAllocation(age: number): AllocationRule[] {
  if (age < 18 || age > 99) {
    throw new Error(`Возраст должен быть от 18 до 99 лет, получено: ${age}`)
  }

  const stockPercent = Math.min(90, Math.max(10, 100 - age))
  const bondPercent = 100 - stockPercent

  return [
    {
      id: 'age-stocks',
      dimension: 'asset_class',
      category: 'Акции',
      targetPercent: stockPercent,
    },
    {
      id: 'age-bonds',
      dimension: 'asset_class',
      category: 'Облигации',
      targetPercent: bondPercent,
    },
  ]
}

/**
 * Calculates age from a birth year relative to a reference year.
 */
export function calculateAge(birthYear: number, referenceYear: number = new Date().getFullYear()): number {
  return referenceYear - birthYear
}
