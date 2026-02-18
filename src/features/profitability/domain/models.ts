export type ReturnPeriod = 'day' | 'week' | 'month' | 'year' | 'all'

export interface PositionReturn {
  ticker: string
  name: string
  costBasis: number
  currentValue: number
  absoluteReturn: number
  relativeReturn: number
  dividendsReceived: number
  commissionsPaid: number
}

export interface PortfolioReturn {
  totalCostBasis: number
  totalCurrentValue: number
  totalAbsoluteReturn: number
  totalRelativeReturn: number
  totalDividends: number
  totalCommissions: number
  positions: PositionReturn[]
  period: ReturnPeriod
}

export interface PricePoint {
  ticker: string
  date: string
  price: number
}

export interface DividendRecord {
  ticker: string
  date: string
  amountPerShare: number
  totalAmount: number
}

export interface CommissionRecord {
  ticker: string
  date: string
  amount: number
  broker: string
}

export interface ProfitabilityReport {
  userId: string
  generatedAt: string
  period: ReturnPeriod
  portfolioReturn: PortfolioReturn
  bestPerformers: PositionReturn[]
  worstPerformers: PositionReturn[]
}
