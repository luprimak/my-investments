import type { BrokerConnection, Portfolio, Position, Transaction, AggregatedPortfolio } from '../domain/models'
import { aggregatePortfolios } from './aggregation-service'

const now = new Date().toISOString()

export const DEMO_CONNECTIONS: BrokerConnection[] = [
  {
    id: 'demo-tbank-1',
    broker: 'tbank',
    displayName: 'Мой Т-Банк',
    connectionType: 'api',
    status: 'active',
    lastSyncAt: now,
    lastSyncStatus: 'success',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'demo-sber-1',
    broker: 'sberbank',
    displayName: 'Сбер ИИС',
    connectionType: 'import',
    status: 'active',
    lastSyncAt: '2026-02-15T14:30:00Z',
    lastSyncStatus: 'success',
    createdAt: '2025-03-10T12:00:00Z',
  },
  {
    id: 'demo-alfa-1',
    broker: 'alfa',
    displayName: 'Альфа Брокер',
    connectionType: 'manual',
    status: 'active',
    lastSyncAt: '2026-02-14T09:00:00Z',
    lastSyncStatus: 'success',
    createdAt: '2025-06-20T15:00:00Z',
  },
  {
    id: 'demo-vtb-1',
    broker: 'vtb',
    displayName: 'ВТБ Инвестиции',
    connectionType: 'import',
    status: 'disconnected',
    lastSyncAt: '2026-01-28T11:00:00Z',
    lastSyncStatus: 'partial',
    createdAt: '2025-09-01T08:00:00Z',
  },
]

const TBANK_POSITIONS: Position[] = [
  { ticker: 'SBER', isin: 'RU0009029540', name: 'Сбербанк ао', instrumentType: 'stock', quantity: 100, averagePrice: 250.00, currentPrice: 308.45, currentValue: 30845.00, unrealizedPnL: 5845.00, unrealizedPnLPercent: 23.38, currency: 'RUB' },
  { ticker: 'YNDX', isin: 'NL0015001YN2', name: 'Яндекс ао', instrumentType: 'stock', quantity: 5, averagePrice: 3800.00, currentPrice: 4120.00, currentValue: 20600.00, unrealizedPnL: 1600.00, unrealizedPnLPercent: 8.42, currency: 'RUB' },
  { ticker: 'LKOH', isin: 'RU0009024277', name: 'ЛУКОЙЛ ао', instrumentType: 'stock', quantity: 3, averagePrice: 6800.00, currentPrice: 7250.00, currentValue: 21750.00, unrealizedPnL: 1350.00, unrealizedPnLPercent: 6.62, currency: 'RUB' },
  { ticker: 'SBMX', isin: 'RU000A101TM0', name: 'SBMX ETF', instrumentType: 'etf', quantity: 50, averagePrice: 18.50, currentPrice: 20.30, currentValue: 1015.00, unrealizedPnL: 90.00, unrealizedPnLPercent: 9.73, currency: 'RUB' },
  { ticker: 'MOEX', isin: 'RU000A0JR4A1', name: 'МосБиржа ао', instrumentType: 'stock', quantity: 40, averagePrice: 200.00, currentPrice: 225.50, currentValue: 9020.00, unrealizedPnL: 1020.00, unrealizedPnLPercent: 12.75, currency: 'RUB' },
]

const SBER_POSITIONS: Position[] = [
  { ticker: 'GAZP', isin: 'RU0007661625', name: 'Газпром ао', instrumentType: 'stock', quantity: 200, averagePrice: 165.00, currentPrice: 152.30, currentValue: 30460.00, unrealizedPnL: -2540.00, unrealizedPnLPercent: -7.70, currency: 'RUB' },
  { ticker: 'ROSN', isin: 'RU000A0J2Q06', name: 'Роснефть ао', instrumentType: 'stock', quantity: 15, averagePrice: 520.00, currentPrice: 580.00, currentValue: 8700.00, unrealizedPnL: 900.00, unrealizedPnLPercent: 11.54, currency: 'RUB' },
  { ticker: 'SU26238RMFS4', isin: 'RU000A101YQ0', name: 'ОФЗ 26238', instrumentType: 'bond', quantity: 10, averagePrice: 620.00, currentPrice: 645.00, currentValue: 6450.00, unrealizedPnL: 250.00, unrealizedPnLPercent: 4.03, currency: 'RUB', nkd: 18.95, maturityDate: '2041-05-20' },
]

const ALFA_POSITIONS: Position[] = [
  { ticker: 'GMKN', isin: 'RU0007288411', name: 'ГМК Норникель', instrumentType: 'stock', quantity: 2, averagePrice: 15800.00, currentPrice: 15200.00, currentValue: 30400.00, unrealizedPnL: -1200.00, unrealizedPnLPercent: -3.80, currency: 'RUB' },
  { ticker: 'SBER', isin: 'RU0009029540', name: 'Сбербанк ао', instrumentType: 'stock', quantity: 50, averagePrice: 270.00, currentPrice: 308.45, currentValue: 15422.50, unrealizedPnL: 1922.50, unrealizedPnLPercent: 14.24, currency: 'RUB' },
  { ticker: 'VTBR', isin: 'RU000A0JP5V6', name: 'ВТБ ао', instrumentType: 'stock', quantity: 500000, averagePrice: 0.02100, currentPrice: 0.02345, currentValue: 11725.00, unrealizedPnL: 1225.00, unrealizedPnLPercent: 11.67, currency: 'RUB' },
]

const VTB_POSITIONS: Position[] = [
  { ticker: 'LKOH', isin: 'RU0009024277', name: 'ЛУКОЙЛ ао', instrumentType: 'stock', quantity: 2, averagePrice: 7000.00, currentPrice: 7250.00, currentValue: 14500.00, unrealizedPnL: 500.00, unrealizedPnLPercent: 3.57, currency: 'RUB' },
  { ticker: 'MGNT', isin: 'RU000A0JKQU8', name: 'Магнит ао', instrumentType: 'stock', quantity: 3, averagePrice: 6200.00, currentPrice: 6450.00, currentValue: 19350.00, unrealizedPnL: 750.00, unrealizedPnLPercent: 4.03, currency: 'RUB' },
]

export const DEMO_PORTFOLIOS: Portfolio[] = [
  {
    brokerId: 'demo-tbank-1',
    broker: 'tbank',
    positions: TBANK_POSITIONS,
    cash: [{ currency: 'RUB', amount: 15230.50 }],
    totalValue: TBANK_POSITIONS.reduce((s, p) => s + p.currentValue, 0) + 15230.50,
    syncedAt: now,
  },
  {
    brokerId: 'demo-sber-1',
    broker: 'sberbank',
    positions: SBER_POSITIONS,
    cash: [{ currency: 'RUB', amount: 5420.00 }],
    totalValue: SBER_POSITIONS.reduce((s, p) => s + p.currentValue, 0) + 5420.00,
    syncedAt: '2026-02-15T14:30:00Z',
  },
  {
    brokerId: 'demo-alfa-1',
    broker: 'alfa',
    positions: ALFA_POSITIONS,
    cash: [{ currency: 'RUB', amount: 8100.00 }, { currency: 'USD', amount: 120.00 }],
    totalValue: ALFA_POSITIONS.reduce((s, p) => s + p.currentValue, 0) + 8100.00 + 120 * 88.45,
    syncedAt: '2026-02-14T09:00:00Z',
  },
  {
    brokerId: 'demo-vtb-1',
    broker: 'vtb',
    positions: VTB_POSITIONS,
    cash: [{ currency: 'RUB', amount: 2000.00 }],
    totalValue: VTB_POSITIONS.reduce((s, p) => s + p.currentValue, 0) + 2000.00,
    syncedAt: '2026-01-28T11:00:00Z',
  },
]

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', brokerId: 'demo-tbank-1', date: '2026-02-10', type: 'buy', ticker: 'MOEX', quantity: 20, price: 218.00, amount: 4360.00, currency: 'RUB', description: 'Покупка МосБиржа 20 лот' },
  { id: 'tx-2', brokerId: 'demo-tbank-1', date: '2026-02-05', type: 'dividend', ticker: 'SBER', amount: 3300.00, currency: 'RUB', description: 'Дивиденды Сбербанк' },
  { id: 'tx-3', brokerId: 'demo-tbank-1', date: '2026-01-28', type: 'buy', ticker: 'YNDX', quantity: 2, price: 3900.00, amount: 7800.00, currency: 'RUB', description: 'Покупка Яндекс 2 шт' },
  { id: 'tx-4', brokerId: 'demo-sber-1', date: '2026-02-01', type: 'coupon', ticker: 'SU26238RMFS4', amount: 354.00, currency: 'RUB', description: 'Купон ОФЗ 26238' },
  { id: 'tx-5', brokerId: 'demo-sber-1', date: '2026-01-15', type: 'buy', ticker: 'ROSN', quantity: 5, price: 545.00, amount: 2725.00, currency: 'RUB', description: 'Покупка Роснефть 5 шт' },
  { id: 'tx-6', brokerId: 'demo-alfa-1', date: '2026-02-12', type: 'sell', ticker: 'VTBR', quantity: 100000, price: 0.02300, amount: 2300.00, currency: 'RUB', description: 'Продажа ВТБ 100000 шт' },
  { id: 'tx-7', brokerId: 'demo-alfa-1', date: '2026-01-20', type: 'commission', amount: 150.00, currency: 'RUB', description: 'Комиссия за январь' },
  { id: 'tx-8', brokerId: 'demo-vtb-1', date: '2026-01-10', type: 'buy', ticker: 'MGNT', quantity: 1, price: 6100.00, amount: 6100.00, currency: 'RUB', description: 'Покупка Магнит 1 шт' },
]

export function getDemoAggregatedPortfolio(): AggregatedPortfolio {
  return aggregatePortfolios(DEMO_PORTFOLIOS)
}
