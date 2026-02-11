/**
 * Asset class classification for MOEX securities.
 *
 * Classification rules:
 * - Tickers ending with "P" after a known base → same asset class as base (preferred shares)
 * - OFZ-* tickers → Government bonds
 * - RU000* ISIN-like tickers → Corporate bonds (simplified)
 * - SU*, ОФЗ* → Government bonds
 * - ETF tickers from known list → ETF
 * - Cash tickers (RUB, USD, EUR) → Cash
 * - Everything else → Stocks (equities)
 */

const ETF_TICKERS = new Set([
  'TMOS', 'SBMX', 'VTBX', 'FXRL', 'FXRB', 'FXGD', 'FXUS',
  'SBSP', 'SBGB', 'VTBB', 'VTBH', 'AKMB', 'TRUR', 'GOLD',
  'SBCB', 'TGLD', 'TBRU', 'LQDT',
])

const CASH_TICKERS = new Set(['RUB', 'USD', 'EUR', 'CNY', 'GBP'])

const BOND_PREFIXES = ['OFZ', 'ОФЗ', 'SU2', 'SU2', 'RU000']

export type AssetClass = 'Акции' | 'Облигации ОФЗ' | 'Облигации корпоративные' | 'ETF' | 'Денежные средства' | 'Прочее'

/**
 * Determines the asset class for a given ticker.
 */
export function getAssetClass(ticker: string): AssetClass {
  const upper = ticker.toUpperCase()

  if (CASH_TICKERS.has(upper)) return 'Денежные средства'
  if (ETF_TICKERS.has(upper)) return 'ETF'

  for (const prefix of BOND_PREFIXES) {
    if (upper.startsWith(prefix)) return 'Облигации ОФЗ'
  }

  // Corporate bonds often have longer alphanumeric codes
  if (/^RU\d{9}/.test(upper)) return 'Облигации корпоративные'

  return 'Акции'
}

/**
 * Returns a simplified asset class grouping (Акции, Облигации, ETF, Кэш).
 */
export function getSimplifiedAssetClass(ticker: string): string {
  const ac = getAssetClass(ticker)
  if (ac === 'Облигации ОФЗ' || ac === 'Облигации корпоративные') return 'Облигации'
  if (ac === 'Денежные средства') return 'Денежные средства'
  return ac
}
