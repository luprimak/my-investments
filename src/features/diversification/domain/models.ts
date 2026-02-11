export type DiversificationDimension =
  | 'asset_class'
  | 'sector'
  | 'geography'
  | 'issuer'
  | 'currency'

export type OverallRating = 'poor' | 'fair' | 'good' | 'excellent'
export type WarningSeverity = 'info' | 'warning' | 'critical'
export type RecommendationType = 'reduce_concentration' | 'add_exposure' | 'rebalance_dimension'
export type SuggestedActionType = 'buy' | 'sell' | 'consider'

export interface CategoryWeight {
  category: string
  currentPercent: number
  positionCount: number
  totalValue: number
}

export interface DiversificationWarning {
  severity: WarningSeverity
  dimension: DiversificationDimension
  category: string
  currentPercent: number
  threshold: number
  message: string
}

export interface DimensionAnalysis {
  dimension: DiversificationDimension
  score: number
  distribution: CategoryWeight[]
  warnings: DiversificationWarning[]
  concentrationIndex: number
}

export interface SuggestedAction {
  action: SuggestedActionType
  ticker?: string
  name: string
  reason: string
}

export interface DiversificationRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  type: RecommendationType
  title: string
  description: string
  affectedDimension: DiversificationDimension
  suggestedActions: SuggestedAction[]
}

export interface DiversificationReport {
  userId: string
  generatedAt: string
  overallScore: number
  overallRating: OverallRating
  dimensions: DimensionAnalysis[]
  recommendations: DiversificationRecommendation[]
  herfindahlIndex: number
}

export interface CorrelatedPair {
  tickerA: string
  tickerB: string
  correlation: number
}

export interface CorrelationMatrix {
  tickers: string[]
  matrix: number[][]
  highlyCorrelated: CorrelatedPair[]
}

/** Portfolio types — reuses the structure from portfolio-optimization */
export interface PortfolioPosition {
  ticker: string
  name: string
  broker: string
  assetClass: string
  sector: string
  currency: string
  geography: string
  currentValue: number
}

export interface Portfolio {
  userId: string
  positions: PortfolioPosition[]
  totalValue: number
}
