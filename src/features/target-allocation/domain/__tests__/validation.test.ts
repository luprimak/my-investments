import { describe, it, expect } from 'vitest'
import {
  validateRulesSum,
  validateRuleValues,
  validateConstraints,
  validateNoDuplicates,
  validateAllocation,
} from '../validation'
import type { AllocationRule, AllocationConstraint } from '../models'

function makeRule(overrides: Partial<AllocationRule> = {}): AllocationRule {
  return {
    id: 'test-1',
    dimension: 'asset_class',
    category: 'Акции',
    targetPercent: 60,
    ...overrides,
  }
}

describe('validateRulesSum', () => {
  it('passes when rules in a dimension sum to 100%', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции', targetPercent: 60 }),
      makeRule({ id: '2', category: 'Облигации', targetPercent: 30 }),
      makeRule({ id: '3', category: 'Кэш', targetPercent: 10 }),
    ]
    expect(validateRulesSum(rules)).toEqual([])
  })

  it('fails when rules do not sum to 100%', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции', targetPercent: 60 }),
      makeRule({ id: '2', category: 'Облигации', targetPercent: 20 }),
    ]
    const errors = validateRulesSum(rules)
    expect(errors).toHaveLength(1)
    expect(errors[0]!.message).toContain('80%')
  })

  it('validates each dimension independently', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', dimension: 'asset_class', category: 'Акции', targetPercent: 100 }),
      makeRule({ id: '2', dimension: 'sector', category: 'IT', targetPercent: 50 }),
    ]
    const errors = validateRulesSum(rules)
    expect(errors).toHaveLength(1)
    expect(errors[0]!.field).toContain('sector')
  })

  it('handles floating point rounding correctly', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'A', targetPercent: 33.33 }),
      makeRule({ id: '2', category: 'B', targetPercent: 33.33 }),
      makeRule({ id: '3', category: 'C', targetPercent: 33.34 }),
    ]
    expect(validateRulesSum(rules)).toEqual([])
  })
})

describe('validateRuleValues', () => {
  it('passes for valid percentages', () => {
    const rules = [makeRule({ targetPercent: 50 })]
    expect(validateRuleValues(rules)).toEqual([])
  })

  it('allows 0% and 100%', () => {
    const rules = [
      makeRule({ id: '1', category: 'A', targetPercent: 0 }),
      makeRule({ id: '2', category: 'B', targetPercent: 100 }),
    ]
    expect(validateRuleValues(rules)).toEqual([])
  })

  it('fails for negative percentages', () => {
    const rules = [makeRule({ targetPercent: -5 })]
    expect(validateRuleValues(rules)).toHaveLength(1)
  })

  it('fails for percentages over 100', () => {
    const rules = [makeRule({ targetPercent: 150 })]
    expect(validateRuleValues(rules)).toHaveLength(1)
  })
})

describe('validateConstraints', () => {
  it('passes for valid constraints', () => {
    const constraints: AllocationConstraint[] = [
      { id: '1', constraintType: 'max_single_issuer', threshold: 15 },
    ]
    expect(validateConstraints(constraints)).toEqual([])
  })

  it('fails for out-of-range thresholds', () => {
    const constraints: AllocationConstraint[] = [
      { id: '1', constraintType: 'max_single_issuer', threshold: -10 },
      { id: '2', constraintType: 'max_single_sector', threshold: 150 },
    ]
    expect(validateConstraints(constraints)).toHaveLength(2)
  })
})

describe('validateNoDuplicates', () => {
  it('passes when no duplicates exist', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции' }),
      makeRule({ id: '2', category: 'Облигации' }),
    ]
    expect(validateNoDuplicates(rules)).toEqual([])
  })

  it('detects duplicate categories in the same dimension', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции', targetPercent: 50 }),
      makeRule({ id: '2', category: 'Акции', targetPercent: 50 }),
    ]
    expect(validateNoDuplicates(rules)).toHaveLength(1)
  })
})

describe('validateAllocation', () => {
  it('returns all errors combined', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции', targetPercent: 150 }),
      makeRule({ id: '2', category: 'Акции', targetPercent: 50 }),
    ]
    const constraints: AllocationConstraint[] = [
      { id: '1', constraintType: 'max_single_issuer', threshold: -5 },
    ]
    const errors = validateAllocation(rules, constraints)
    // Should have: out of range (150%), duplicate, sum != 100, constraint out of range
    expect(errors.length).toBeGreaterThan(0)
  })

  it('returns empty for valid allocation', () => {
    const rules: AllocationRule[] = [
      makeRule({ id: '1', category: 'Акции', targetPercent: 60 }),
      makeRule({ id: '2', category: 'Облигации', targetPercent: 40 }),
    ]
    expect(validateAllocation(rules, [])).toEqual([])
  })
})
