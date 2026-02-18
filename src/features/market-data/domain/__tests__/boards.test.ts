import { describe, it, expect } from 'vitest'
import { getBoardForType, buildMarketPath, BOARDS } from '../boards'

describe('boards', () => {
  it('maps stock type to TQBR', () => {
    expect(getBoardForType('stock')).toBe('TQBR')
  })

  it('maps preferred_stock to TQBR', () => {
    expect(getBoardForType('preferred_stock')).toBe('TQBR')
  })

  it('maps etf to TQTF', () => {
    expect(getBoardForType('etf')).toBe('TQTF')
  })

  it('maps bond_ofz to TQOB', () => {
    expect(getBoardForType('bond_ofz')).toBe('TQOB')
  })

  it('maps bond_corp to TQCB', () => {
    expect(getBoardForType('bond_corp')).toBe('TQCB')
  })

  it('defaults to TQBR for unknown types', () => {
    expect(getBoardForType('index')).toBe('TQBR')
  })

  it('builds correct market path for TQBR', () => {
    expect(buildMarketPath('TQBR')).toBe('stock/markets/shares/boards/TQBR')
  })

  it('builds correct market path for TQOB', () => {
    expect(buildMarketPath('TQOB')).toBe('stock/markets/bonds/boards/TQOB')
  })

  it('builds correct market path for CETS', () => {
    expect(buildMarketPath('CETS')).toBe('currency/markets/selt/boards/CETS')
  })

  it('defaults for unknown boards', () => {
    expect(buildMarketPath('UNKNOWN')).toBe('stock/markets/shares/boards/TQBR')
  })

  it('has all expected boards', () => {
    expect(Object.keys(BOARDS)).toContain('TQBR')
    expect(Object.keys(BOARDS)).toContain('TQCB')
    expect(Object.keys(BOARDS)).toContain('TQOB')
    expect(Object.keys(BOARDS)).toContain('TQTF')
    expect(Object.keys(BOARDS)).toContain('CETS')
  })
})
