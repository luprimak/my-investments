export type AllocationDimension = 'asset_class' | 'sector' | 'issuer'
export type AllocationSource = 'template' | 'custom' | 'age-based'
export type RiskLevel = 'low' | 'medium' | 'high'
export type DeviationSeverity = 'ok' | 'warning' | 'critical'
export type ConstraintType = 'max_single_issuer' | 'max_single_sector' | 'min_asset_class'

export interface AllocationRule {
  id: string
  dimension: AllocationDimension
  category: string
  targetPercent: number
}

export interface AllocationConstraint {
  id: string
  constraintType: ConstraintType
  threshold: number
}

export interface TargetAllocation {
  id: string
  userId: string
  name: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  source: AllocationSource
  rules: AllocationRule[]
  constraints: AllocationConstraint[]
}

export interface AllocationTemplate {
  id: string
  name: string
  description: string
  riskLevel: RiskLevel
  rules: AllocationRule[]
}

export interface AllocationHistoryEntry {
  id: string
  userId: string
  allocationId: string
  changedAt: string
  previousSnapshot: TargetAllocation
  reason: string
}

export interface Deviation {
  category: string
  dimension: AllocationDimension
  targetPercent: number
  currentPercent: number
  deviationPercent: number
  severity: DeviationSeverity
}

/** Portfolio position — consumed from future brokerage integration (#6) */
export interface PortfolioPosition {
  ticker: string
  name: string
  assetClass: string
  sector: string
  currentValue: number
}

export interface Portfolio {
  userId: string
  positions: PortfolioPosition[]
  totalValue: number
}

/** Deviation alert thresholds — user-configurable */
export interface DeviationThresholds {
  warningPercent: number
  criticalPercent: number
}

export const DEFAULT_THRESHOLDS: DeviationThresholds = {
  warningPercent: 10,
  criticalPercent: 20,
}
