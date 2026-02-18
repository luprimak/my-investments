import type { PositionReturn } from '../domain/models'
import type { PositionInput, CalculationContext, IReturnCalculator } from './types'
import { filterByPeriod } from './period-calculator'

export const absoluteCalculator: IReturnCalculator = {
  calculate(positions: PositionInput[], context: CalculationContext): PositionReturn[] {
    const periodDividends = filterByPeriod(context.dividends, context.period)
    const periodCommissions = filterByPeriod(context.commissions, context.period)

    return positions.map(pos => {
      const currentValue = pos.currentPrice * pos.quantity
      const dividendsReceived = periodDividends
        .filter(d => d.ticker === pos.ticker)
        .reduce((sum, d) => sum + d.totalAmount, 0)
      const commissionsPaid = periodCommissions
        .filter(c => c.ticker === pos.ticker)
        .reduce((sum, c) => sum + c.amount, 0)

      const absoluteReturn = currentValue - pos.costBasis + dividendsReceived - commissionsPaid

      return {
        ticker: pos.ticker,
        name: pos.name,
        costBasis: pos.costBasis,
        currentValue,
        absoluteReturn,
        relativeReturn: 0, // filled by relative-calculator
        dividendsReceived,
        commissionsPaid,
      }
    })
  },
}
