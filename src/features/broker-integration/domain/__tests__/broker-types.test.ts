import { describe, it, expect } from 'vitest'
import { BROKER_META, BROKER_LIST, getBrokerMeta } from '../broker-types'

describe('broker-types', () => {
  it('defines all 5 broker types', () => {
    expect(BROKER_LIST).toHaveLength(5)
    expect(BROKER_LIST).toContain('tbank')
    expect(BROKER_LIST).toContain('alfa')
    expect(BROKER_LIST).toContain('sberbank')
    expect(BROKER_LIST).toContain('vtb')
    expect(BROKER_LIST).toContain('manual')
  })

  it('provides metadata for each broker', () => {
    for (const broker of BROKER_LIST) {
      const meta = BROKER_META[broker]
      expect(meta).toBeDefined()
      expect(meta.displayName).toBeTruthy()
      expect(meta.shortName).toBeTruthy()
      expect(meta.color).toBeTruthy()
    }
  })

  it('tbank supports real-time sync', () => {
    const meta = getBrokerMeta('tbank')
    expect(meta.capabilities.supportsRealTimeSync).toBe(true)
    expect(meta.capabilities.supportsTransactionHistory).toBe(true)
    expect(meta.capabilities.maxRequestsPerMinute).toBeGreaterThan(0)
  })

  it('sberbank does not support real-time sync', () => {
    const meta = getBrokerMeta('sberbank')
    expect(meta.capabilities.supportsRealTimeSync).toBe(false)
    expect(meta.capabilities.supportsReportImport).toBe(true)
  })

  it('manual broker has no API capabilities', () => {
    const meta = getBrokerMeta('manual')
    expect(meta.capabilities.supportsRealTimeSync).toBe(false)
    expect(meta.capabilities.supportsReportImport).toBe(false)
    expect(meta.capabilities.supportedReportFormats).toHaveLength(0)
  })

  it('all brokers with report import support xlsx', () => {
    for (const broker of BROKER_LIST) {
      const meta = BROKER_META[broker]
      if (meta.capabilities.supportsReportImport) {
        expect(meta.capabilities.supportedReportFormats).toContain('xlsx')
      }
    }
  })
})
