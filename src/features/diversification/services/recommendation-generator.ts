import type {
  DimensionAnalysis,
  DiversificationRecommendation,
  DiversificationWarning,
  SuggestedAction,
} from '../domain/models'

const MAX_RECOMMENDATIONS = 7

/**
 * Generates prioritized diversification recommendations from dimension analyses.
 * Limits output to the top 5-7 most impactful recommendations.
 */
export function generateRecommendations(
  dimensions: DimensionAnalysis[],
): DiversificationRecommendation[] {
  const recommendations: DiversificationRecommendation[] = []

  for (const dim of dimensions) {
    for (const warning of dim.warnings) {
      if (warning.severity === 'info') continue

      const rec = warningToRecommendation(warning, dim)
      if (rec) {
        recommendations.push(rec)
      }
    }
  }

  // Sort by priority (high > medium > low) then by severity
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, MAX_RECOMMENDATIONS)
}

function warningToRecommendation(
  warning: DiversificationWarning,
  analysis: DimensionAnalysis,
): DiversificationRecommendation | null {
  switch (warning.dimension) {
    case 'issuer':
      return issuerRecommendation(warning, analysis)
    case 'sector':
      return sectorRecommendation(warning, analysis)
    case 'asset_class':
      return assetClassRecommendation(warning)
    case 'currency':
      return currencyRecommendation(warning)
    case 'geography':
      return geographyRecommendation(warning)
    default:
      return null
  }
}

function issuerRecommendation(
  warning: DiversificationWarning,
  analysis: DimensionAnalysis,
): DiversificationRecommendation {
  if (warning.category === 'Топ-5 эмитентов') {
    return {
      id: `div-issuer-top5`,
      priority: warning.severity === 'critical' ? 'high' : 'medium',
      type: 'reduce_concentration',
      title: `Снизьте концентрацию топ-5 эмитентов с ${warning.currentPercent.toFixed(1)}% до ${warning.threshold}%`,
      description: 'Высокая концентрация в нескольких эмитентах повышает риск. Распределите капитал между большим числом компаний.',
      affectedDimension: 'issuer',
      suggestedActions: [
        { action: 'sell', name: 'Крупнейшие позиции', reason: 'Частичное сокращение для снижения концентрации' },
        { action: 'consider', name: 'Новые эмитенты', reason: 'Добавление новых позиций для диверсификации' },
      ],
    }
  }

  return {
    id: `div-issuer-${warning.category}`,
    priority: warning.severity === 'critical' ? 'high' : 'medium',
    type: 'reduce_concentration',
    title: `Снизьте долю ${warning.category} с ${warning.currentPercent.toFixed(1)}% до ${warning.threshold}%`,
    description: `${warning.category} составляет ${warning.currentPercent.toFixed(1)}% портфеля, что превышает рекомендуемый максимум ${warning.threshold}%. Высокая концентрация в одном эмитенте создаёт специфический риск.`,
    affectedDimension: 'issuer',
    suggestedActions: [
      { action: 'sell', ticker: warning.category, name: warning.category, reason: `Сократить до ${warning.threshold}% портфеля` },
      ...suggestAlternatives(analysis, warning.category),
    ],
  }
}

function sectorRecommendation(
  warning: DiversificationWarning,
  analysis: DimensionAnalysis,
): DiversificationRecommendation {
  if (warning.category === 'Секторы') {
    return {
      id: `div-sector-count`,
      priority: 'medium',
      type: 'add_exposure',
      title: 'Добавьте позиции в новых секторах',
      description: 'Портфель сконцентрирован в малом числе секторов. Добавьте экспозицию в 2-3 новых сектора.',
      affectedDimension: 'sector',
      suggestedActions: suggestMissingSectors(analysis),
    }
  }

  return {
    id: `div-sector-${warning.category}`,
    priority: warning.severity === 'critical' ? 'high' : 'medium',
    type: 'reduce_concentration',
    title: `Снизьте долю сектора "${warning.category}" с ${warning.currentPercent.toFixed(1)}% до ${warning.threshold}%`,
    description: `Сектор "${warning.category}" занимает ${warning.currentPercent.toFixed(1)}% портфеля. Секторный риск может привести к значительным потерям при отраслевом спаде.`,
    affectedDimension: 'sector',
    suggestedActions: [
      { action: 'sell', name: `Позиции в ${warning.category}`, reason: 'Частичное сокращение секторной экспозиции' },
    ],
  }
}

function assetClassRecommendation(
  warning: DiversificationWarning,
): DiversificationRecommendation {
  return {
    id: `div-ac-${warning.category}`,
    priority: warning.severity === 'critical' ? 'high' : 'medium',
    type: 'rebalance_dimension',
    title: `Перебалансируйте классы активов — ${warning.category} составляет ${warning.currentPercent.toFixed(1)}%`,
    description: `Класс активов "${warning.category}" доминирует в портфеле. Добавьте другие классы активов для защиты от рыночной волатильности.`,
    affectedDimension: 'asset_class',
    suggestedActions: [
      { action: 'consider', name: 'Облигации ОФЗ', reason: 'Стабильный доход и защита от снижения рынка акций' },
      { action: 'consider', name: 'ETF на широкий рынок', reason: 'Диверсификация через индексные фонды' },
    ],
  }
}

function currencyRecommendation(
  warning: DiversificationWarning,
): DiversificationRecommendation {
  return {
    id: `div-curr-${warning.category}`,
    priority: 'low',
    type: 'add_exposure',
    title: `Рассмотрите валютную диверсификацию — ${warning.currentPercent.toFixed(1)}% в ${warning.category}`,
    description: 'Высокая концентрация в одной валюте создаёт валютный риск.',
    affectedDimension: 'currency',
    suggestedActions: [
      { action: 'consider', name: 'Валютные ETF на MOEX', reason: 'Экспозиция к иностранным валютам через биржевые фонды' },
    ],
  }
}

function geographyRecommendation(
  warning: DiversificationWarning,
): DiversificationRecommendation {
  return {
    id: `div-geo-${warning.category}`,
    priority: 'low',
    type: 'add_exposure',
    title: `Рассмотрите географическую диверсификацию — ${warning.currentPercent.toFixed(1)}% в ${warning.category}`,
    description: 'Концентрация в одной юрисдикции создаёт страновой риск.',
    affectedDimension: 'geography',
    suggestedActions: [
      { action: 'consider', name: 'Международные ETF', reason: 'Доступ к зарубежным рынкам через MOEX' },
    ],
  }
}

function suggestAlternatives(
  analysis: DimensionAnalysis,
  excludeCategory: string,
): SuggestedAction[] {
  // Suggest buying underrepresented categories
  const underweight = analysis.distribution
    .filter(d => d.category !== excludeCategory && d.currentPercent < 5)
    .slice(0, 2)

  return underweight.map(d => ({
    action: 'consider' as const,
    name: d.category,
    reason: `Составляет только ${d.currentPercent.toFixed(1)}% — есть потенциал для увеличения`,
  }))
}

function suggestMissingSectors(analysis: DimensionAnalysis): SuggestedAction[] {
  const presentSectors = new Set(analysis.distribution.map(d => d.category))
  const commonSectors = ['Финансовый', 'Нефть и газ', 'IT', 'Потребительский', 'Металлургия', 'Энергетика']

  return commonSectors
    .filter(s => !presentSectors.has(s))
    .slice(0, 3)
    .map(sector => ({
      action: 'consider' as const,
      name: sector,
      reason: `Сектор "${sector}" не представлен в портфеле`,
    }))
}
