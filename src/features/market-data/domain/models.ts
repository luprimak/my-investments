export type SecurityType =
  | 'stock'
  | 'preferred_stock'
  | 'bond_ofz'
  | 'bond_corp'
  | 'bond_muni'
  | 'etf'
  | 'index'

export type Currency = 'RUB' | 'USD' | 'EUR'

export type MarketStatus = 'open' | 'closed' | 'premarket'

export interface Security {
  ticker: string
  isin: string
  name: string
  shortName: string
  type: SecurityType
  currency: Currency
  board: string
  sector: string
  listLevel: number
  lotSize: number
}

export interface Quote {
  ticker: string
  lastPrice: number
  previousClose: number
  openPrice: number
  highPrice: number
  lowPrice: number
  change: number
  changePercent: number
  volume: number
  volumeValue: number
  bid: number
  ask: number
  updatedAt: string
  marketStatus: MarketStatus
}

export interface BondData {
  ticker: string
  faceValue: number
  couponRate: number
  couponValue: number
  couponFrequency: number
  nkd: number
  nextCouponDate: string
  maturityDate: string
  duration: number
  yieldToMaturity: number
  offerDate?: string
}

export interface Candle {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  value: number
}

export interface DividendInfo {
  ticker: string
  registryCloseDate: string
  dividendPerShare: number
  currency: Currency
}

export interface CouponPayment {
  ticker: string
  couponDate: string
  couponValue: number
  recordDate: string
}

export interface IndexData {
  indexId: string
  name: string
  currentValue: number
  change: number
  changePercent: number
  components: IndexComponent[]
}

export interface IndexComponent {
  ticker: string
  weight: number
}

export interface ExchangeRate {
  pair: string
  rate: number
  updatedAt: string
}

export interface MoexDataBlock {
  columns: string[]
  data: (string | number | null)[][]
}

export interface MoexResponse {
  [blockName: string]: MoexDataBlock
}
