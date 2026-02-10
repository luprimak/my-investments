import type { AllocationRule, AllocationConstraint, AllocationDimension } from './models'

export interface ValidationError {
  field: string
  message: string
}

/**
 * Groups rules by dimension and validates that each group sums to exactly 100%.
 */
export function validateRulesSum(rules: AllocationRule[]): ValidationError[] {
  const errors: ValidationError[] = []
  const byDimension = groupByDimension(rules)

  for (const [dimension, dimensionRules] of Object.entries(byDimension)) {
    const sum = dimensionRules.reduce((acc, r) => acc + r.targetPercent, 0)
    const rounded = Math.round(sum * 100) / 100

    if (rounded !== 100) {
      errors.push({
        field: `rules.${dimension}`,
        message: `Правила для "${dimensionLabel(dimension as AllocationDimension)}" в сумме дают ${rounded}%, а должны давать 100%`,
      })
    }
  }

  return errors
}

/**
 * Validates individual rule values are within 0-100 range.
 */
export function validateRuleValues(rules: AllocationRule[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const rule of rules) {
    if (rule.targetPercent < 0 || rule.targetPercent > 100) {
      errors.push({
        field: `rule.${rule.id}`,
        message: `Значение для "${rule.category}" должно быть от 0% до 100%, получено ${rule.targetPercent}%`,
      })
    }
  }

  return errors
}

/**
 * Validates constraint thresholds.
 */
export function validateConstraints(constraints: AllocationConstraint[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const c of constraints) {
    if (c.threshold < 0 || c.threshold > 100) {
      errors.push({
        field: `constraint.${c.id}`,
        message: `Порог ограничения должен быть от 0% до 100%, получено ${c.threshold}%`,
      })
    }
  }

  return errors
}

/**
 * Validates that there are no duplicate categories within the same dimension.
 */
export function validateNoDuplicates(rules: AllocationRule[]): ValidationError[] {
  const errors: ValidationError[] = []
  const byDimension = groupByDimension(rules)

  for (const [dimension, dimensionRules] of Object.entries(byDimension)) {
    const seen = new Set<string>()
    for (const rule of dimensionRules) {
      if (seen.has(rule.category)) {
        errors.push({
          field: `rules.${dimension}.${rule.category}`,
          message: `Дублирование категории "${rule.category}" в "${dimensionLabel(dimension as AllocationDimension)}"`,
        })
      }
      seen.add(rule.category)
    }
  }

  return errors
}

/**
 * Runs all validations and returns combined errors.
 */
export function validateAllocation(
  rules: AllocationRule[],
  constraints: AllocationConstraint[],
): ValidationError[] {
  return [
    ...validateRuleValues(rules),
    ...validateNoDuplicates(rules),
    ...validateRulesSum(rules),
    ...validateConstraints(constraints),
  ]
}

function groupByDimension(rules: AllocationRule[]): Record<string, AllocationRule[]> {
  const result: Record<string, AllocationRule[]> = {}
  for (const rule of rules) {
    const group = result[rule.dimension] ?? []
    group.push(rule)
    result[rule.dimension] = group
  }
  return result
}

function dimensionLabel(dimension: AllocationDimension): string {
  const labels: Record<AllocationDimension, string> = {
    asset_class: 'Классы активов',
    sector: 'Секторы',
    issuer: 'Эмитенты',
  }
  return labels[dimension]
}
