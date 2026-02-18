import { describe, it, expect } from 'vitest'
import { parseBlock, parseFirstRow, extractBlock } from '../moex-response-parser'
import type { MoexDataBlock } from '../../domain/models'

describe('moex-response-parser', () => {
  const BLOCK: MoexDataBlock = {
    columns: ['SECID', 'LAST', 'VOLUME', 'CHANGE'],
    data: [
      ['SBER', 308.45, 45230100, 3.25],
      ['GAZP', 152.30, 32150000, -1.80],
    ],
  }

  interface ParsedRow {
    ticker: string
    price: number
    volume: number
  }

  const MAPPING = {
    ticker: 'SECID',
    price: 'LAST',
    volume: 'VOLUME',
  }

  it('parses block into typed objects', () => {
    const results = parseBlock<ParsedRow>(BLOCK, MAPPING)
    expect(results).toHaveLength(2)
    expect(results[0]!.ticker).toBe('SBER')
    expect(results[0]!.price).toBe(308.45)
    expect(results[0]!.volume).toBe(45230100)
    expect(results[1]!.ticker).toBe('GAZP')
  })

  it('handles missing columns gracefully', () => {
    const mapping = { ticker: 'SECID', price: 'LAST', unknown: 'NONEXISTENT' }
    const results = parseBlock<{ ticker: string; price: number; unknown: null }>(BLOCK, mapping)
    expect(results[0]!.unknown).toBeNull()
  })

  it('returns empty array for null block', () => {
    const results = parseBlock<ParsedRow>(null as unknown as MoexDataBlock, MAPPING)
    expect(results).toHaveLength(0)
  })

  it('returns empty array for block with empty data', () => {
    const emptyBlock: MoexDataBlock = { columns: ['SECID'], data: [] }
    const results = parseBlock<ParsedRow>(emptyBlock, MAPPING)
    expect(results).toHaveLength(0)
  })

  it('parseFirstRow returns first row', () => {
    const result = parseFirstRow<ParsedRow>(BLOCK, MAPPING)
    expect(result).not.toBeNull()
    expect(result!.ticker).toBe('SBER')
  })

  it('parseFirstRow returns null for empty data', () => {
    const emptyBlock: MoexDataBlock = { columns: ['SECID'], data: [] }
    const result = parseFirstRow<ParsedRow>(emptyBlock, MAPPING)
    expect(result).toBeNull()
  })

  it('extractBlock extracts named block from response', () => {
    const response = {
      marketdata: { columns: ['SECID', 'LAST'], data: [['SBER', 300]] },
    }
    const block = extractBlock(response, 'marketdata')
    expect(block).not.toBeNull()
    expect(block!.columns).toEqual(['SECID', 'LAST'])
    expect(block!.data).toHaveLength(1)
  })

  it('extractBlock returns null for missing block', () => {
    const block = extractBlock({}, 'nonexistent')
    expect(block).toBeNull()
  })

  it('filters out empty rows', () => {
    const blockWithEmpty: MoexDataBlock = {
      columns: ['SECID', 'LAST'],
      data: [
        ['SBER', 300],
        [],
        ['GAZP', 150],
      ],
    }
    const results = parseBlock<{ ticker: string; price: number }>(blockWithEmpty, { ticker: 'SECID', price: 'LAST' })
    expect(results).toHaveLength(2)
  })
})
