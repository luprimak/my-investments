// Domain models
export type {
  DiversificationReport,
  DimensionAnalysis,
  CategoryWeight,
  DiversificationWarning,
  DiversificationRecommendation,
  SuggestedAction,
  CorrelationMatrix,
  CorrelatedPair,
  Portfolio,
  PortfolioPosition,
  DiversificationDimension,
  OverallRating,
  WarningSeverity,
} from './domain/models'

export { DEFAULT_RULES } from './domain/rules'
export type { DiversificationRules } from './domain/rules'

export { computeCompositeScore, scoreToRating, computeDimensionScore } from './domain/scoring'

// Classifiers
export { getSector, getAllSectors } from './classifiers/sector-classifier'
export { getAssetClass, getSimplifiedAssetClass } from './classifiers/asset-class-classifier'

// Services
export { calculateHHI, classifyHHI, calculateHHIFromPercents } from './services/hhi-calculator'
export { generateReport, generateAggregatedReport } from './services/diversification-service'
export { generateRecommendations } from './services/recommendation-generator'

// Analyzers
export { IssuerAnalyzer } from './analyzers/issuer-analyzer'
export { SectorAnalyzer } from './analyzers/sector-analyzer'
export { AssetClassAnalyzer } from './analyzers/asset-class-analyzer'
export { GeographyAnalyzer } from './analyzers/geography-analyzer'
export { CurrencyAnalyzer } from './analyzers/currency-analyzer'
