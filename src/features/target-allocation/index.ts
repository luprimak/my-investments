// Domain models
export type {
  TargetAllocation,
  AllocationRule,
  AllocationConstraint,
  AllocationTemplate,
  AllocationHistoryEntry,
  Deviation,
  DeviationThresholds,
  Portfolio,
  PortfolioPosition,
  AllocationDimension,
  AllocationSource,
  RiskLevel,
  DeviationSeverity,
  ConstraintType,
} from './domain/models'
export { DEFAULT_THRESHOLDS } from './domain/models'

// Templates
export { ALLOCATION_TEMPLATES, getTemplateById } from './domain/templates'

// Age calculator
export { calculateAgeBasedAllocation, calculateAge } from './domain/age-calculator'

// Validation
export { validateAllocation, validateRulesSum } from './domain/validation'
export type { ValidationError } from './domain/validation'

// Services
export {
  createAllocation,
  updateAllocation,
  getActiveAllocation,
  getUserAllocations,
  deleteAllocation,
} from './services/allocation-service'

export {
  computeDeviations,
  needsRebalancing,
  rebalancingRecommended,
} from './services/deviation-service'

export {
  recordChange,
  getUserHistory,
  getAllocationHistory,
} from './services/history-service'
