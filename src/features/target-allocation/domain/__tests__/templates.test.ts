import { describe, it, expect } from 'vitest'
import { ALLOCATION_TEMPLATES, getTemplateById } from '../templates'

describe('ALLOCATION_TEMPLATES', () => {
  it('provides 4 templates', () => {
    expect(ALLOCATION_TEMPLATES).toHaveLength(4)
  })

  it.each(ALLOCATION_TEMPLATES)('template "$name" has rules summing to 100%', (template) => {
    const sum = template.rules.reduce((s, r) => s + r.targetPercent, 0)
    expect(sum).toBe(100)
  })

  it.each(ALLOCATION_TEMPLATES)('template "$name" has all rules in asset_class dimension', (template) => {
    for (const rule of template.rules) {
      expect(rule.dimension).toBe('asset_class')
    }
  })

  it('includes conservative, moderate, aggressive, and retirement templates', () => {
    const ids = ALLOCATION_TEMPLATES.map(t => t.id)
    expect(ids).toContain('conservative')
    expect(ids).toContain('moderate')
    expect(ids).toContain('aggressive')
    expect(ids).toContain('retirement')
  })
})

describe('getTemplateById', () => {
  it('returns the correct template', () => {
    const t = getTemplateById('conservative')
    expect(t).toBeDefined()
    expect(t!.name).toBe('Консервативная')
  })

  it('returns undefined for unknown ID', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined()
  })
})
