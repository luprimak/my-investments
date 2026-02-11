import type {
  Portfolio,
  BrokerProfile,
  BrokerSummary,
  BrokerOptimizationPlan,
  Recommendation,
} from '../domain/models'

interface BrokerOptimizerInput {
  portfolio: Portfolio
  brokerProfiles: BrokerProfile[]
}

/**
 * Analyzes portfolio distribution across brokers and recommends
 * consolidation opportunities for commission savings.
 *
 * This engine is advisory only — it does not automate transfers.
 */
export function analyzeBrokerDistribution(input: BrokerOptimizerInput): BrokerOptimizationPlan {
  const { portfolio, brokerProfiles } = input

  const currentDistribution = computeBrokerSummaries(portfolio, brokerProfiles)
  const recommendations = generateConsolidationRecommendations(currentDistribution, brokerProfiles)
  const savingsEstimate = estimateAnnualSavings(currentDistribution, brokerProfiles)

  return {
    currentDistribution,
    recommendations,
    savingsEstimate,
  }
}

function computeBrokerSummaries(
  portfolio: Portfolio,
  brokerProfiles: BrokerProfile[],
): BrokerSummary[] {
  const brokerMap = new Map<string, { totalValue: number; positionCount: number }>()

  for (const pos of portfolio.positions) {
    const existing = brokerMap.get(pos.broker) ?? { totalValue: 0, positionCount: 0 }
    existing.totalValue += pos.currentValue
    existing.positionCount += 1
    brokerMap.set(pos.broker, existing)
  }

  return Array.from(brokerMap.entries()).map(([broker, data]) => {
    const profile = brokerProfiles.find(b => b.broker === broker)
    return {
      broker,
      totalValue: Math.round(data.totalValue * 100) / 100,
      positionCount: data.positionCount,
      avgCommissionRate: profile?.commissionRate ?? 0,
      suitableFor: profile?.suitableFor ?? [],
    }
  })
}

/**
 * Recommends consolidating small accounts into the broker with the lowest commission.
 * A broker account is considered "small" if it has fewer than 3 positions
 * or less than 5% of the total portfolio.
 */
function generateConsolidationRecommendations(
  summaries: BrokerSummary[],
  brokerProfiles: BrokerProfile[],
): Recommendation[] {
  if (summaries.length <= 1) return []

  const recommendations: Recommendation[] = []
  const totalValue = summaries.reduce((sum, s) => sum + s.totalValue, 0)
  if (totalValue === 0) return []

  // Find the best (lowest commission) broker
  const bestBroker = [...summaries].sort((a, b) => a.avgCommissionRate - b.avgCommissionRate)[0]!

  for (const summary of summaries) {
    if (summary.broker === bestBroker.broker) continue

    const portfolioPercent = (summary.totalValue / totalValue) * 100
    const isSmallAccount = summary.positionCount < 3 || portfolioPercent < 5

    if (isSmallAccount) {
      const annualCommSaving = summary.totalValue * (summary.avgCommissionRate - bestBroker.avgCommissionRate)

      recommendations.push({
        id: `consolidate-${summary.broker}`,
        type: 'transfer',
        priority: 'low',
        title: `Консолидировать ${summary.broker} → ${bestBroker.broker}`,
        reason: `Счёт ${summary.broker} содержит ${summary.positionCount} позиций (${portfolioPercent.toFixed(1)}% портфеля). Консолидация в ${bestBroker.broker} может снизить комиссии.`,
        impact: {
          estimatedCommission: 0,
          estimatedTax: 0,
          totalCost: 0,
          portfolioImprovement: annualCommSaving > 0
            ? `Экономия ~${Math.round(annualCommSaving).toLocaleString('ru-RU')} ₽/год на комиссиях`
            : 'Упрощение управления портфелем',
        },
        actions: [],
        status: 'pending',
      })
    }
  }

  // Warn about high-commission brokers
  for (const summary of summaries) {
    if (summary.avgCommissionRate > 0 && summary.avgCommissionRate > bestBroker.avgCommissionRate * 2) {
      const existingRec = recommendations.find(r => r.id === `consolidate-${summary.broker}`)
      if (!existingRec) {
        recommendations.push({
          id: `high-comm-${summary.broker}`,
          type: 'transfer',
          priority: 'medium',
          title: `Высокие комиссии у ${summary.broker}`,
          reason: `Комиссия ${(summary.avgCommissionRate * 100).toFixed(3)}% — в ${(summary.avgCommissionRate / bestBroker.avgCommissionRate).toFixed(1)}× выше, чем у ${bestBroker.broker} (${(bestBroker.avgCommissionRate * 100).toFixed(3)}%).`,
          impact: {
            estimatedCommission: 0,
            estimatedTax: 0,
            totalCost: 0,
            portfolioImprovement: `Рассмотрите перенос активных торговых позиций в ${bestBroker.broker}`,
          },
          actions: [],
          status: 'pending',
        })
      }
    }
  }

  return recommendations
}

function estimateAnnualSavings(
  summaries: BrokerSummary[],
  brokerProfiles: BrokerProfile[],
): number {
  if (summaries.length <= 1) return 0

  const bestRate = Math.min(...summaries.map(s => s.avgCommissionRate).filter(r => r > 0), Infinity)
  if (bestRate === Infinity) return 0

  let savings = 0
  for (const summary of summaries) {
    if (summary.avgCommissionRate > bestRate) {
      // Rough estimate: assume 12 trades/year per position
      const annualTradeVolume = summary.totalValue * 0.5 // 50% turnover assumption
      savings += annualTradeVolume * (summary.avgCommissionRate - bestRate)
    }
  }

  return Math.round(savings * 100) / 100
}
