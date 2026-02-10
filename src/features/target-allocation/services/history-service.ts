import type { AllocationHistoryEntry, TargetAllocation } from '../domain/models'

let history: AllocationHistoryEntry[] = []

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Records a snapshot of the previous allocation before a change.
 */
export function recordChange(
  userId: string,
  allocationId: string,
  previousSnapshot: TargetAllocation,
  reason: string,
): AllocationHistoryEntry {
  const entry: AllocationHistoryEntry = {
    id: generateId(),
    userId,
    allocationId,
    changedAt: new Date().toISOString(),
    previousSnapshot,
    reason,
  }

  history.push(entry)
  return entry
}

/**
 * Returns allocation change history for a user, newest first.
 */
export function getUserHistory(userId: string): AllocationHistoryEntry[] {
  return history
    .filter(h => h.userId === userId)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))
}

/**
 * Returns history for a specific allocation, newest first.
 */
export function getAllocationHistory(allocationId: string): AllocationHistoryEntry[] {
  return history
    .filter(h => h.allocationId === allocationId)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))
}

/**
 * Resets all data (for testing).
 */
export function _resetHistory(): void {
  history = []
}
