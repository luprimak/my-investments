import type { ReturnPeriod, DividendRecord, CommissionRecord, PricePoint, PositionReturn } from '../domain/models'

export interface PositionInput {
  ticker: string
  name: string
  quantity: number
  currentPrice: number
  costBasis: number
}

export interface CalculationContext {
  period: ReturnPeriod
  dividends: DividendRecord[]
  commissions: CommissionRecord[]
  priceHistory: PricePoint[]
}

export interface IReturnCalculator {
  calculate(positions: PositionInput[], context: CalculationContext): PositionReturn[]
}
