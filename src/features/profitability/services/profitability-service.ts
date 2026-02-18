import type { ReturnPeriod, DividendRecord, CommissionRecord, PricePoint, ProfitabilityReport } from '../domain/models'
import type { PositionInput, CalculationContext } from '../calculators/types'
import { absoluteCalculator } from '../calculators/absolute-calculator'
import { enrichWithRelativeReturn } from '../calculators/relative-calculator'
import { aggregatePortfolio, extractPerformers } from '../calculators/portfolio-calculator'

export function generateProfitabilityReport(
  userId: string,
  positions: PositionInput[],
  dividends: DividendRecord[],
  commissions: CommissionRecord[],
  priceHistory: PricePoint[],
  period: ReturnPeriod,
): ProfitabilityReport {
  const context: CalculationContext = {
    period,
    dividends,
    commissions,
    priceHistory,
  }

  const absoluteReturns = absoluteCalculator.calculate(positions, context)
  const enrichedReturns = enrichWithRelativeReturn(absoluteReturns)
  const portfolioReturn = aggregatePortfolio(enrichedReturns, period)
  const { best, worst } = extractPerformers(enrichedReturns, 3)

  return {
    userId,
    generatedAt: new Date().toISOString(),
    period,
    portfolioReturn,
    bestPerformers: best,
    worstPerformers: worst,
  }
}

// Mock data for demo (consistent with portfolio-view mock positions)
const MOCK_DIVIDENDS: DividendRecord[] = [
  { ticker: 'SBER', date: '2024-07-15', amountPerShare: 33.3, totalAmount: 3330 },
  { ticker: 'LKOH', date: '2024-10-01', amountPerShare: 793, totalAmount: 3965 },
  { ticker: 'GAZP', date: '2024-07-10', amountPerShare: 15.24, totalAmount: 3048 },
  { ticker: 'ROSN', date: '2024-07-05', amountPerShare: 30.77, totalAmount: 1538.5 },
  { ticker: 'GMKN', date: '2024-12-15', amountPerShare: 915.33, totalAmount: 1830.66 },
  { ticker: 'MOEX', date: '2024-05-20', amountPerShare: 17.95, totalAmount: 1795 },
]

const MOCK_COMMISSIONS: CommissionRecord[] = [
  { ticker: 'SBER', date: '2024-03-15', amount: 7.2, broker: 'sberbank' },
  { ticker: 'LKOH', date: '2024-01-20', amount: 96, broker: 'sberbank' },
  { ticker: 'GAZP', date: '2024-02-20', amount: 10.5, broker: 'tbank' },
  { ticker: 'YNDX', date: '2024-08-01', amount: 90, broker: 'tbank' },
  { ticker: 'GMKN', date: '2024-04-20', amount: 75, broker: 'vtb' },
  { ticker: 'SU26238', date: '2024-06-01', amount: 9.3, broker: 'alfa' },
  { ticker: 'RU000A106Y', date: '2024-04-15', amount: 8.55, broker: 'alfa' },
  { ticker: 'MOEX', date: '2024-07-15', amount: 6.9, broker: 'alfa' },
]

const MOCK_POSITIONS: PositionInput[] = [
  { ticker: 'SBER', name: 'Сбербанк', quantity: 100, currentPrice: 295.5, costBasis: 24000 },
  { ticker: 'SBERP', name: 'Сбербанк (прив.)', quantity: 50, currentPrice: 280, costBasis: 12500 },
  { ticker: 'LKOH', name: 'Лукойл', quantity: 5, currentPrice: 7200, costBasis: 32000 },
  { ticker: 'SU26238', name: 'ОФЗ 26238', quantity: 50, currentPrice: 620, costBasis: 30000 },
  { ticker: 'RU000A106Y', name: 'Газпром Капитал', quantity: 30, currentPrice: 980, costBasis: 28500 },
  { ticker: 'TMOS', name: 'Тинькофф iMOEX', quantity: 500, currentPrice: 6.8, costBasis: 3000 },
  { ticker: 'GAZP', name: 'Газпром', quantity: 200, currentPrice: 155, costBasis: 35000 },
  { ticker: 'YNDX', name: 'Яндекс', quantity: 10, currentPrice: 3950, costBasis: 30000 },
  { ticker: 'MGNT', name: 'Магнит', quantity: 3, currentPrice: 5200, costBasis: 14400 },
  { ticker: 'TBRU', name: 'Тинькофф Облигации', quantity: 1000, currentPrice: 5.5, costBasis: 5000 },
  { ticker: 'VTBM', name: 'ВТБ Ликвидность', quantity: 2000, currentPrice: 1.08, costBasis: 2000 },
  { ticker: 'GMKN', name: 'Норильский Никель', quantity: 2, currentPrice: 13800, costBasis: 25000 },
  { ticker: 'ROSN', name: 'Роснефть', quantity: 50, currentPrice: 580, costBasis: 26000 },
  { ticker: 'MOEX', name: 'Московская биржа', quantity: 100, currentPrice: 230, costBasis: 20000 },
  { ticker: 'SU26240', name: 'ОФЗ 26240', quantity: 20, currentPrice: 710, costBasis: 13800 },
]

export function getDemoReport(period: ReturnPeriod): ProfitabilityReport {
  return generateProfitabilityReport(
    'user-1',
    MOCK_POSITIONS,
    MOCK_DIVIDENDS,
    MOCK_COMMISSIONS,
    [],
    period,
  )
}
