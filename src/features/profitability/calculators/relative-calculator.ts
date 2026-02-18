import type { PositionReturn } from '../domain/models'

export function enrichWithRelativeReturn(positions: PositionReturn[]): PositionReturn[] {
  return positions.map(pos => ({
    ...pos,
    relativeReturn: pos.costBasis > 0
      ? (pos.absoluteReturn / pos.costBasis) * 100
      : 0,
  }))
}
