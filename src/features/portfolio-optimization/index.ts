// Domain models
export type {
  Recommendation,
  RecommendationImpact,
  TradeAction,
  JunkPosition,
  JunkPositionReport,
  RebalancePlan,
  AllocationSnapshot,
  BrokerSummary,
  BrokerOptimizationPlan,
  Portfolio,
  PortfolioPosition,
  BrokerProfile,
  RecommendationType,
  RecommendationPriority,
  RecommendationStatus,
  TradeDirection,
  JunkReason,
} from './domain/models'

export { DEFAULT_JUNK_CONFIG } from './domain/constants'
export type { JunkDetectionConfig } from './domain/constants'

// Engines
export { detectJunkPositions, generateJunkRecommendations } from './engines/junk-detector'
export { computeRebalancePlan } from './engines/rebalance-engine'
export { analyzeBrokerDistribution } from './engines/broker-optimizer'
export { estimateCommission, estimateTax, calculateImpact, isCostEffective, isLongTermExempt } from './engines/cost-calculator'

// Services
export { runOptimization } from './services/optimization-service'
export type { OptimizationInput, OptimizationResult } from './services/optimization-service'
export {
  storeRecommendations,
  updateRecommendationStatus,
  getAllRecommendations,
  getPendingRecommendations,
  getAcceptedRecommendations,
  clearRecommendations,
} from './services/recommendation-store'
