import type { SecurityType } from './models'

export interface BoardConfig {
  id: string
  engine: string
  market: string
  description: string
  securityTypes: SecurityType[]
}

export const BOARDS: Record<string, BoardConfig> = {
  TQBR: {
    id: 'TQBR',
    engine: 'stock',
    market: 'shares',
    description: 'Акции основной режим T+2',
    securityTypes: ['stock', 'preferred_stock'],
  },
  TQCB: {
    id: 'TQCB',
    engine: 'stock',
    market: 'bonds',
    description: 'Корпоративные облигации',
    securityTypes: ['bond_corp'],
  },
  TQOB: {
    id: 'TQOB',
    engine: 'stock',
    market: 'bonds',
    description: 'ОФЗ (государственные облигации)',
    securityTypes: ['bond_ofz'],
  },
  TQTF: {
    id: 'TQTF',
    engine: 'stock',
    market: 'shares',
    description: 'ETF биржевые фонды',
    securityTypes: ['etf'],
  },
  CETS: {
    id: 'CETS',
    engine: 'currency',
    market: 'selt',
    description: 'Валютный рынок',
    securityTypes: [],
  },
}

export const STOCK_BOARDS = ['TQBR', 'TQTF'] as const
export const BOND_BOARDS = ['TQCB', 'TQOB'] as const

export function getBoardForType(type: SecurityType): string {
  for (const [boardId, config] of Object.entries(BOARDS)) {
    if (config.securityTypes.includes(type)) {
      return boardId
    }
  }
  return 'TQBR'
}

export function buildMarketPath(board: string): string {
  const config = BOARDS[board]
  if (!config) return 'stock/markets/shares/boards/TQBR'
  return `${config.engine}/markets/${config.market}/boards/${config.id}`
}
