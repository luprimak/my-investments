import type { Recommendation, RecommendationStatus } from '../domain/models'

let recommendations: Recommendation[] = []

/**
 * Stores a set of recommendations, replacing any existing ones with the same ID.
 */
export function storeRecommendations(newRecs: Recommendation[]): void {
  for (const rec of newRecs) {
    const idx = recommendations.findIndex(r => r.id === rec.id)
    if (idx >= 0) {
      recommendations[idx] = rec
    } else {
      recommendations.push(rec)
    }
  }
}

/**
 * Updates the status of a recommendation (accept/dismiss).
 */
export function updateRecommendationStatus(id: string, status: RecommendationStatus): boolean {
  const rec = recommendations.find(r => r.id === id)
  if (!rec) return false
  rec.status = status
  return true
}

/**
 * Returns all stored recommendations.
 */
export function getAllRecommendations(): Recommendation[] {
  return [...recommendations]
}

/**
 * Returns pending recommendations only.
 */
export function getPendingRecommendations(): Recommendation[] {
  return recommendations.filter(r => r.status === 'pending')
}

/**
 * Returns accepted recommendations (user's action checklist).
 */
export function getAcceptedRecommendations(): Recommendation[] {
  return recommendations.filter(r => r.status === 'accepted')
}

/**
 * Clears all recommendations (e.g., on re-analysis).
 */
export function clearRecommendations(): void {
  recommendations = []
}

/**
 * Resets store (for testing).
 */
export function _resetRecommendationStore(): void {
  recommendations = []
}
