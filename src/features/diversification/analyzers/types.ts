import type { DimensionAnalysis, Portfolio } from '../domain/models'

export interface IDiversificationAnalyzer {
  analyze(portfolio: Portfolio): DimensionAnalysis
}
