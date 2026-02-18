import type {
  Security,
  Quote,
  Candle,
  BondData,
  CouponPayment,
  DividendInfo,
  ExchangeRate,
  IndexData,
} from '../domain/models'
import { getQuote, getQuotes } from './quote-service'
import { getSecurityInfo, searchSecurities } from './security-info-service'
import { getHistory } from './history-service'
import { getBondData, getCouponSchedule } from './bond-service'
import { getExchangeRate } from './exchange-rate-service'

export interface IMarketDataProvider {
  getQuote(ticker: string): Promise<Quote>
  getQuotes(tickers: string[]): Promise<Map<string, Quote>>
  getSecurityInfo(ticker: string): Promise<Security>
  searchSecurities(query: string): Promise<Security[]>
  getHistory(ticker: string, from: string, to: string): Promise<Candle[]>
  getBondData(ticker: string): Promise<BondData>
  getCouponSchedule(ticker: string): Promise<CouponPayment[]>
  getDividends(ticker: string): Promise<DividendInfo[]>
  getExchangeRate(pair: string): Promise<ExchangeRate>
  getIndex(indexId: string): Promise<IndexData>
}

export const marketDataService: IMarketDataProvider = {
  getQuote: (ticker) => getQuote(ticker),
  getQuotes: (tickers) => getQuotes(tickers),
  getSecurityInfo: (ticker) => getSecurityInfo(ticker),
  searchSecurities: (query) => searchSecurities(query),
  getHistory: (ticker, from, to) => getHistory(ticker, from, to),
  getBondData: (ticker) => getBondData(ticker),
  getCouponSchedule: (ticker) => getCouponSchedule(ticker),

  getDividends: async (_ticker): Promise<DividendInfo[]> => {
    // MOEX ISS does not expose dividend history via a simple endpoint.
    // Future: integrate with third-party dividend data source.
    return []
  },

  getExchangeRate: (pair) => getExchangeRate(pair),

  getIndex: async (indexId): Promise<IndexData> => {
    // Placeholder: full index integration is a separate enhancement.
    return {
      indexId,
      name: indexId === 'IMOEX' ? 'Индекс МосБиржи' : indexId,
      currentValue: 0,
      change: 0,
      changePercent: 0,
      components: [],
    }
  },
}
