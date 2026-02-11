export interface DiversificationRules {
  /** Max allocation to any single issuer (default: 30%) */
  maxSingleIssuer: number
  /** Max allocation to any single sector (default: 50%) */
  maxSingleSector: number
  /** Optimal number of positions */
  optimalPositionCount: { min: number; max: number }
  /** Max combined weight of top 5 positions (default: 60%) */
  maxTop5Concentration: number
  /** Max allocation to any single asset class (default: 70%) */
  maxSingleAssetClass: number
  /** Max allocation to any single currency (default: 80%) */
  maxSingleCurrency: number
  /** Max allocation to any single geography (default: 90%) */
  maxSingleGeography: number
}

export const DEFAULT_RULES: DiversificationRules = {
  maxSingleIssuer: 30,
  maxSingleSector: 50,
  optimalPositionCount: { min: 15, max: 30 },
  maxTop5Concentration: 60,
  maxSingleAssetClass: 70,
  maxSingleCurrency: 80,
  maxSingleGeography: 90,
}
