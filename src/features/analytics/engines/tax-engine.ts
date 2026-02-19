import type { TaxReport, TaxableTransaction } from '../domain/models'
import {
  NDFL_RATE,
  NDFL_HIGH_RATE,
  NDFL_HIGH_INCOME_THRESHOLD,
  TAX_EXEMPT_HOLDING_YEARS,
} from '../domain/constants'

export function computeDividendTax(amount: number, annualIncome: number): number {
  const rate = annualIncome > NDFL_HIGH_INCOME_THRESHOLD ? NDFL_HIGH_RATE : NDFL_RATE
  return Math.round(amount * rate * 100) / 100
}

export function computeCapitalGainsTax(
  sellAmount: number,
  costBasis: number,
  purchaseDate: string,
  annualIncome: number,
): { tax: number; isExempt: boolean; exemptReason?: string } {
  const gain = sellAmount - costBasis
  if (gain <= 0) return { tax: 0, isExempt: false }

  const purchaseDateObj = new Date(purchaseDate)
  const now = new Date()
  const holdingYears = (now.getTime() - purchaseDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

  if (holdingYears >= TAX_EXEMPT_HOLDING_YEARS) {
    return { tax: 0, isExempt: true, exemptReason: '3+ года владения' }
  }

  const rate = annualIncome > NDFL_HIGH_INCOME_THRESHOLD ? NDFL_HIGH_RATE : NDFL_RATE
  return { tax: Math.round(gain * rate * 100) / 100, isExempt: false }
}

export function computeTaxReport(
  transactions: TaxableTransaction[],
  period: { year: number; quarter?: number },
): TaxReport {
  const filtered = transactions.filter(t => {
    const txDate = new Date(t.date)
    if (txDate.getFullYear() !== period.year) return false
    if (period.quarter !== undefined) {
      const txQuarter = Math.ceil((txDate.getMonth() + 1) / 3)
      return txQuarter === period.quarter
    }
    return true
  })

  let dividendIncome = 0
  let dividendTax = 0
  let capitalGains = 0
  let capitalGainsTax = 0
  let taxExemptGains = 0

  for (const tx of filtered) {
    if (tx.type === 'dividend') {
      dividendIncome += tx.amount
      dividendTax += tx.taxAmount
    } else {
      if (tx.isExempt) {
        taxExemptGains += tx.amount
      } else {
        capitalGains += tx.amount
        capitalGainsTax += tx.taxAmount
      }
    }
  }

  return {
    period,
    dividendIncome: Math.round(dividendIncome * 100) / 100,
    dividendTax: Math.round(dividendTax * 100) / 100,
    capitalGains: Math.round(capitalGains * 100) / 100,
    capitalGainsTax: Math.round(capitalGainsTax * 100) / 100,
    taxExemptGains: Math.round(taxExemptGains * 100) / 100,
    totalTaxLiability: Math.round((dividendTax + capitalGainsTax) * 100) / 100,
    transactions: filtered,
  }
}
