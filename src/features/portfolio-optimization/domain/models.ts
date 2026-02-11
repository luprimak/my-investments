export type RecommendationType =
  | 'close_position'
  | 'rebalance_trade'
  | 'transfer'
  | 'close_account'

export type RecommendationPriority = 'high' | 'medium' | 'low'
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed'
export type TradeDirection = 'buy' | 'sell' | 'transfer_out' | 'transfer_in'
export type JunkReason = 'small_position' | 'deep_loss' | 'illiquid' | 'delisted' | 'duplicate'

export interface RecommendationImpact {
  estimatedCommission: number
  estimatedTax: number
  totalCost: number
  portfolioImprovement: string
}

export interface TradeAction {
  broker: string
  ticker: string
  direction: TradeDirection
  quantity: number
  estimatedPrice: number
  estimatedAmount: number
}

export interface Recommendation {
  id: string
  type: RecommendationType
  priority: RecommendationPriority
  title: string
  reason: string
  impact: RecommendationImpact
  actions: TradeAction[]
  status: RecommendationStatus
}

export interface JunkPosition {
  ticker: string
  broker: string
  reason: JunkReason
  currentValue: number
  percentOfPortfolio: number
  details: string
}

export interface JunkPositionReport {
  positions: JunkPosition[]
  totalJunkValue: number
  percentOfPortfolio: number
}

export interface AllocationSnapshot {
  categories: { category: string; percent: number }[]
}

export interface RebalancePlan {
  recommendations: Recommendation[]
  totalCost: number
  beforeSnapshot: AllocationSnapshot
  afterSnapshot: AllocationSnapshot
}

export interface BrokerSummary {
  broker: string
  totalValue: number
  positionCount: number
  avgCommissionRate: number
  suitableFor: string[]
}

export interface BrokerOptimizationPlan {
  currentDistribution: BrokerSummary[]
  recommendations: Recommendation[]
  savingsEstimate: number
}

/** Position with cost basis and broker info — consumed from Issue #6 */
export interface PortfolioPosition {
  ticker: string
  name: string
  broker: string
  assetClass: string
  sector: string
  quantity: number
  currentPrice: number
  currentValue: number
  costBasis: number
  purchaseDate: string
  dailyVolume: number
}

export interface Portfolio {
  userId: string
  positions: PortfolioPosition[]
  totalValue: number
}

/** Broker commission profile */
export interface BrokerProfile {
  broker: string
  commissionRate: number
  minCommission: number
  suitableFor: string[]
}
