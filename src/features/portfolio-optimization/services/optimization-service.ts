import type {
  Portfolio,
  BrokerProfile,
  JunkPositionReport,
  RebalancePlan,
  BrokerOptimizationPlan,
  Recommendation,
} from '../domain/models'
import type { JunkDetectionConfig } from '../domain/constants'
import type { AllocationRule, DeviationThresholds } from '../../target-allocation/domain/models'
import { computeDeviations } from '../../target-allocation/services/deviation-service'
import { detectJunkPositions, generateJunkRecommendations } from '../engines/junk-detector'
import { computeRebalancePlan } from '../engines/rebalance-engine'
import { analyzeBrokerDistribution } from '../engines/broker-optimizer'
import { storeRecommendations, clearRecommendations } from './recommendation-store'

export interface OptimizationInput {
  portfolio: Portfolio
  targetRules?: AllocationRule[]
  brokerProfiles: BrokerProfile[]
  junkConfig?: JunkDetectionConfig
  deviationThresholds?: DeviationThresholds
}

export interface OptimizationResult {
  junkReport: JunkPositionReport
  rebalancePlan: RebalancePlan
  brokerPlan: BrokerOptimizationPlan
  allRecommendations: Recommendation[]
}

/**
 * Orchestrates all optimization engines and produces a unified result.
 *
 * Pipeline:
 * 1. Junk detection (independent — only needs portfolio)
 * 2. Rebalancing (needs target allocation from #9)
 * 3. Broker optimization (needs multi-broker data)
 *
 * All engines run independently and their recommendations are stored together.
 */
export function runOptimization(input: OptimizationInput): OptimizationResult {
  const {
    portfolio,
    targetRules,
    brokerProfiles,
    junkConfig,
    deviationThresholds,
  } = input

  // Adapt portfolio for target-allocation deviation service
  const targetAllocPortfolio = {
    userId: portfolio.userId,
    positions: portfolio.positions.map(p => ({
      ticker: p.ticker,
      name: p.name,
      assetClass: p.assetClass,
      sector: p.sector,
      currentValue: p.currentValue,
    })),
    totalValue: portfolio.totalValue,
  }

  // 1. Junk detection
  const junkReport = detectJunkPositions(portfolio, junkConfig)
  const junkRecommendations = generateJunkRecommendations(junkReport, brokerProfiles)

  // 2. Rebalancing (only if target allocation is configured)
  let rebalancePlan: RebalancePlan
  if (targetRules && targetRules.length > 0) {
    const deviations = computeDeviations(targetRules, targetAllocPortfolio, deviationThresholds)
    rebalancePlan = computeRebalancePlan({
      portfolio,
      deviations,
      brokerProfiles,
    })
  } else {
    rebalancePlan = {
      recommendations: [],
      totalCost: 0,
      beforeSnapshot: { categories: [] },
      afterSnapshot: { categories: [] },
    }
  }

  // 3. Broker optimization
  const brokerPlan = analyzeBrokerDistribution({ portfolio, brokerProfiles })

  // Combine all recommendations
  const allRecommendations = [
    ...junkRecommendations,
    ...rebalancePlan.recommendations,
    ...brokerPlan.recommendations,
  ]

  // Store for user to accept/dismiss
  clearRecommendations()
  storeRecommendations(allRecommendations)

  return {
    junkReport,
    rebalancePlan,
    brokerPlan,
    allRecommendations,
  }
}
