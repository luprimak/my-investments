import { describe, it, expect } from 'vitest'
import { getSector, getAllSectors } from '../sector-classifier'
import { getAssetClass, getSimplifiedAssetClass } from '../asset-class-classifier'

describe('getSector', () => {
  it('classifies Sberbank as Financial', () => {
    expect(getSector('SBER')).toBe('Финансовый')
  })

  it('classifies Gazprom as Oil & Gas', () => {
    expect(getSector('GAZP')).toBe('Нефть и газ')
  })

  it('classifies Yandex as IT', () => {
    expect(getSector('YNDX')).toBe('IT')
  })

  it('classifies Norilsk Nickel as Metals', () => {
    expect(getSector('GMKN')).toBe('Металлургия')
  })

  it('returns Прочее for unknown tickers', () => {
    expect(getSector('UNKNOWN')).toBe('Прочее')
  })

  it('is case-insensitive', () => {
    expect(getSector('sber')).toBe('Финансовый')
  })

  it('classifies Aeroflot as Transport', () => {
    expect(getSector('AFLT')).toBe('Транспорт')
  })
})

describe('getAllSectors', () => {
  it('returns unique sectors', () => {
    const sectors = getAllSectors()
    expect(new Set(sectors).size).toBe(sectors.length)
    expect(sectors.length).toBeGreaterThan(5)
  })
})

describe('getAssetClass', () => {
  it('classifies regular tickers as stocks', () => {
    expect(getAssetClass('SBER')).toBe('Акции')
  })

  it('classifies ETF tickers', () => {
    expect(getAssetClass('TMOS')).toBe('ETF')
    expect(getAssetClass('FXRL')).toBe('ETF')
  })

  it('classifies cash tickers', () => {
    expect(getAssetClass('RUB')).toBe('Денежные средства')
    expect(getAssetClass('USD')).toBe('Денежные средства')
  })

  it('classifies OFZ bonds', () => {
    expect(getAssetClass('OFZ26230')).toBe('Облигации ОФЗ')
    expect(getAssetClass('SU26230')).toBe('Облигации ОФЗ')
  })
})

describe('getSimplifiedAssetClass', () => {
  it('groups all bonds together', () => {
    expect(getSimplifiedAssetClass('OFZ26230')).toBe('Облигации')
  })

  it('keeps stocks as-is', () => {
    expect(getSimplifiedAssetClass('SBER')).toBe('Акции')
  })
})
