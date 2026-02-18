import type { MoexDataBlock } from '../domain/models'

export type ColumnMapping<T> = Record<keyof T, string>

export function parseBlock<T>(block: MoexDataBlock, mapping: Partial<ColumnMapping<T>>): T[] {
  if (!block || !block.columns || !block.data) return []

  const { columns, data } = block

  return data
    .filter(row => row.length > 0)
    .map(row => {
      const obj = {} as Record<string, unknown>
      for (const [field, colName] of Object.entries(mapping)) {
        const idx = columns.indexOf(colName as string)
        if (idx >= 0) {
          obj[field] = row[idx]
        } else {
          obj[field] = null
        }
      }
      return obj as T
    })
}

export function extractBlock(response: Record<string, unknown>, blockName: string): MoexDataBlock | null {
  const block = response[blockName] as { columns?: string[]; data?: (string | number | null)[][] } | undefined
  if (!block || !block.columns || !block.data) return null
  return { columns: block.columns, data: block.data }
}

export function parseFirstRow<T>(block: MoexDataBlock, mapping: Partial<ColumnMapping<T>>): T | null {
  const results = parseBlock<T>(block, mapping)
  return results.length > 0 ? results[0]! : null
}
