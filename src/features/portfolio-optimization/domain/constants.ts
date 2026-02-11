export interface JunkDetectionConfig {
  /** Minimum position as % of total portfolio (default: 1%) */
  minPositionPercent: number
  /** Minimum position value in RUB (default: 5000) */
  minPositionValue: number
  /** Unrealized loss threshold for "deep loss" (default: -50%) */
  deepLossThreshold: number
  /** Minimum daily trading volume in RUB for liquidity (default: 100000) */
  illiquidVolumeThreshold: number
}

export const DEFAULT_JUNK_CONFIG: JunkDetectionConfig = {
  minPositionPercent: 1,
  minPositionValue: 5000,
  deepLossThreshold: -50,
  illiquidVolumeThreshold: 100_000,
}

/** Russian NDFL rate for capital gains (13%, or 15% for income above 5M RUB/year) */
export const NDFL_RATE = 0.13
export const NDFL_HIGH_RATE = 0.15
export const NDFL_HIGH_INCOME_THRESHOLD = 5_000_000

/** Long-term holding tax exemption: 3+ years for Russian securities */
export const TAX_EXEMPT_HOLDING_YEARS = 3

/** Minimum net benefit threshold: skip trades where cost exceeds this % of trade amount */
export const MIN_COST_BENEFIT_RATIO = 0.05
