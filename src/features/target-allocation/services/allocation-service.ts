import type { AllocationRule, AllocationConstraint, TargetAllocation, AllocationSource } from '../domain/models'
import { validateAllocation, type ValidationError } from '../domain/validation'

let allocations: TargetAllocation[] = []

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

/**
 * Creates a new target allocation. Validates rules before saving.
 * If this allocation is set as active, deactivates all others for the same user.
 */
export function createAllocation(params: {
  userId: string
  name: string
  source: AllocationSource
  rules: AllocationRule[]
  constraints?: AllocationConstraint[]
  isActive?: boolean
}): { allocation: TargetAllocation } | { errors: ValidationError[] } {
  const constraints = params.constraints ?? []
  const errors = validateAllocation(params.rules, constraints)

  if (errors.length > 0) {
    return { errors }
  }

  const allocation: TargetAllocation = {
    id: generateId(),
    userId: params.userId,
    name: params.name,
    createdAt: now(),
    updatedAt: now(),
    isActive: params.isActive ?? true,
    source: params.source,
    rules: params.rules.map(r => ({ ...r, id: r.id || generateId() })),
    constraints: constraints.map(c => ({ ...c, id: c.id || generateId() })),
  }

  if (allocation.isActive) {
    deactivateUserAllocations(params.userId)
  }

  allocations.push(allocation)
  return { allocation }
}

/**
 * Updates an existing allocation.
 */
export function updateAllocation(
  id: string,
  updates: Partial<Pick<TargetAllocation, 'name' | 'rules' | 'constraints' | 'isActive'>>,
): { allocation: TargetAllocation } | { errors: ValidationError[] } | null {
  const index = allocations.findIndex(a => a.id === id)
  if (index === -1) return null

  const existing = allocations[index]!
  const newRules = updates.rules ?? existing.rules
  const newConstraints = updates.constraints ?? existing.constraints

  const errors = validateAllocation(newRules, newConstraints)
  if (errors.length > 0) {
    return { errors }
  }

  const updated: TargetAllocation = {
    ...existing,
    ...updates,
    rules: newRules,
    constraints: newConstraints,
    updatedAt: now(),
  }

  if (updates.isActive === true) {
    deactivateUserAllocations(existing.userId)
  }

  allocations[index] = updated
  return { allocation: updated }
}

/**
 * Retrieves the currently active allocation for a user.
 */
export function getActiveAllocation(userId: string): TargetAllocation | null {
  return allocations.find(a => a.userId === userId && a.isActive) ?? null
}

/**
 * Lists all allocations for a user.
 */
export function getUserAllocations(userId: string): TargetAllocation[] {
  return allocations.filter(a => a.userId === userId)
}

/**
 * Deletes an allocation.
 */
export function deleteAllocation(id: string): boolean {
  const before = allocations.length
  allocations = allocations.filter(a => a.id !== id)
  return allocations.length < before
}

/**
 * Resets all data (for testing).
 */
export function _resetAllocations(): void {
  allocations = []
}

function deactivateUserAllocations(userId: string): void {
  for (const a of allocations) {
    if (a.userId === userId) {
      a.isActive = false
    }
  }
}
