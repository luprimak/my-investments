import type { Security, Quote, BondData, Candle, ExchangeRate } from '../domain/models'

const now = new Date().toISOString()

export const DEMO_SECURITIES: Security[] = [
  { ticker: 'SBER', isin: 'RU0009029540', name: 'Сбербанк', shortName: 'Сбербанк ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Финансы', listLevel: 1, lotSize: 10 },
  { ticker: 'GAZP', isin: 'RU0007661625', name: 'Газпром', shortName: 'Газпром ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Нефть и газ', listLevel: 1, lotSize: 10 },
  { ticker: 'LKOH', isin: 'RU0009024277', name: 'ЛУКОЙЛ', shortName: 'ЛУКОЙЛ ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Нефть и газ', listLevel: 1, lotSize: 1 },
  { ticker: 'YNDX', isin: 'NL0015001YN2', name: 'Яндекс', shortName: 'Яндекс ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'IT', listLevel: 1, lotSize: 1 },
  { ticker: 'ROSN', isin: 'RU000A0J2Q06', name: 'Роснефть', shortName: 'Роснефть ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Нефть и газ', listLevel: 1, lotSize: 1 },
  { ticker: 'GMKN', isin: 'RU0007288411', name: 'Норникель', shortName: 'ГМК Норникель', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Металлургия', listLevel: 1, lotSize: 1 },
  { ticker: 'MOEX', isin: 'RU000A0JR4A1', name: 'МосБиржа', shortName: 'МосБиржа ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Финансы', listLevel: 1, lotSize: 10 },
  { ticker: 'VTBR', isin: 'RU000A0JP5V6', name: 'ВТБ', shortName: 'ВТБ ао', type: 'stock', currency: 'RUB', board: 'TQBR', sector: 'Финансы', listLevel: 1, lotSize: 10000 },
  { ticker: 'SU26238RMFS4', isin: 'RU000A101YQ0', name: 'ОФЗ 26238', shortName: 'ОФЗ 26238', type: 'bond_ofz', currency: 'RUB', board: 'TQOB', sector: 'Государственные облигации', listLevel: 1, lotSize: 1 },
  { ticker: 'SBMX', isin: 'RU000A101TM0', name: 'Сбер Индекс МосБиржи', shortName: 'SBMX ETF', type: 'etf', currency: 'RUB', board: 'TQTF', sector: 'ETF', listLevel: 1, lotSize: 1 },
]

export const DEMO_QUOTES: Quote[] = [
  { ticker: 'SBER', lastPrice: 308.45, previousClose: 305.20, openPrice: 306.10, highPrice: 310.00, lowPrice: 304.80, change: 3.25, changePercent: 1.06, volume: 45_230_100, volumeValue: 13_952_000_000, bid: 308.40, ask: 308.50, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'GAZP', lastPrice: 152.30, previousClose: 154.10, openPrice: 153.50, highPrice: 155.00, lowPrice: 151.20, change: -1.80, changePercent: -1.17, volume: 32_150_000, volumeValue: 4_895_000_000, bid: 152.25, ask: 152.35, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'LKOH', lastPrice: 7250.00, previousClose: 7180.00, openPrice: 7200.00, highPrice: 7290.00, lowPrice: 7160.00, change: 70.00, changePercent: 0.97, volume: 512_300, volumeValue: 3_714_000_000, bid: 7248.00, ask: 7252.00, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'YNDX', lastPrice: 4120.00, previousClose: 4050.00, openPrice: 4060.00, highPrice: 4150.00, lowPrice: 4030.00, change: 70.00, changePercent: 1.73, volume: 285_400, volumeValue: 1_175_000_000, bid: 4118.00, ask: 4122.00, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'ROSN', lastPrice: 580.00, previousClose: 576.50, openPrice: 577.00, highPrice: 583.00, lowPrice: 575.00, change: 3.50, changePercent: 0.61, volume: 1_200_000, volumeValue: 696_000_000, bid: 579.80, ask: 580.20, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'GMKN', lastPrice: 15200.00, previousClose: 15350.00, openPrice: 15300.00, highPrice: 15400.00, lowPrice: 15100.00, change: -150.00, changePercent: -0.98, volume: 98_500, volumeValue: 1_497_000_000, bid: 15190.00, ask: 15210.00, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'MOEX', lastPrice: 225.50, previousClose: 223.80, openPrice: 224.00, highPrice: 227.00, lowPrice: 223.00, change: 1.70, changePercent: 0.76, volume: 5_600_000, volumeValue: 1_262_000_000, bid: 225.40, ask: 225.60, updatedAt: now, marketStatus: 'closed' },
  { ticker: 'VTBR', lastPrice: 0.02345, previousClose: 0.02310, openPrice: 0.02320, highPrice: 0.02360, lowPrice: 0.02300, change: 0.00035, changePercent: 1.52, volume: 12_500_000_000, volumeValue: 293_000_000, bid: 0.02344, ask: 0.02346, updatedAt: now, marketStatus: 'closed' },
]

export const DEMO_BOND: BondData = {
  ticker: 'SU26238RMFS4',
  faceValue: 1000,
  couponRate: 7.10,
  couponValue: 35.40,
  couponFrequency: 2,
  nkd: 18.95,
  nextCouponDate: '2026-05-20',
  maturityDate: '2041-05-20',
  duration: 8.5,
  yieldToMaturity: 14.2,
}

export const DEMO_EXCHANGE_RATES: ExchangeRate[] = [
  { pair: 'USD/RUB', rate: 88.45, updatedAt: now },
  { pair: 'EUR/RUB', rate: 96.20, updatedAt: now },
  { pair: 'CNY/RUB', rate: 12.15, updatedAt: now },
]

export function generateDemoHistory(ticker: string, days: number): Candle[] {
  const candles: Candle[] = []
  const baseQuote = DEMO_QUOTES.find(q => q.ticker === ticker)
  let price = baseQuote ? baseQuote.lastPrice * 0.85 : 100

  const today = new Date()
  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const volatility = price * 0.02
    const change = (Math.random() - 0.48) * volatility
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = Math.floor(Math.random() * 1_000_000 + 100_000)

    candles.push({
      date: date.toISOString().slice(0, 10),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      value: Math.round(volume * close),
    })

    price = close
  }

  return candles
}
