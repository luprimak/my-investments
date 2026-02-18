import type { Security, SecurityType } from '../domain/models'
import { moexGet } from '../api/moex-client'
import { securityInfoUrl, securitySearchUrl } from '../api/moex-endpoints'
import { extractBlock, parseBlock, parseFirstRow } from '../api/moex-response-parser'
import { cacheGet, cacheSet } from '../cache/market-data-cache'

interface RawDescription {
  name: string
  value: string
}

interface RawBoard {
  secid: string
  boardid: string
  title: string
  is_primary: number | null
}

const DESCRIPTION_MAPPING = {
  name: 'name',
  value: 'value',
}

const BOARD_MAPPING = {
  secid: 'secid',
  boardid: 'boardid',
  title: 'title',
  is_primary: 'is_primary',
}

function inferType(boardId: string, groupName: string): SecurityType {
  if (boardId === 'TQTF') return 'etf'
  if (boardId === 'TQOB') return 'bond_ofz'
  if (boardId === 'TQCB') return 'bond_corp'
  if (groupName.toLowerCase().includes('привилегированн')) return 'preferred_stock'
  return 'stock'
}

export async function getSecurityInfo(ticker: string): Promise<Security> {
  const cached = cacheGet<Security>('security:meta', ticker)
  if (cached) return cached

  const url = securityInfoUrl(ticker)
  const response = await moexGet<Record<string, unknown>>(url)

  const descBlock = extractBlock(response, 'description')
  const boardsBlock = extractBlock(response, 'boards')

  const descRows = descBlock ? parseBlock<RawDescription>(descBlock, DESCRIPTION_MAPPING) : []
  const boardRows = boardsBlock ? parseBlock<RawBoard>(boardsBlock, BOARD_MAPPING) : []

  const descMap = new Map(descRows.map(d => [d.name, d.value]))
  const primaryBoard = boardRows.find(b => b.is_primary === 1) ?? boardRows[0]

  const security: Security = {
    ticker,
    isin: descMap.get('ISIN') ?? '',
    name: descMap.get('NAME') ?? descMap.get('SHORTNAME') ?? ticker,
    shortName: descMap.get('SHORTNAME') ?? ticker,
    type: inferType(primaryBoard?.boardid ?? 'TQBR', descMap.get('GROUP') ?? ''),
    currency: (descMap.get('FACEUNIT') as Security['currency']) ?? 'RUB',
    board: primaryBoard?.boardid ?? 'TQBR',
    sector: descMap.get('TYPENAME') ?? '',
    listLevel: parseInt(descMap.get('LISTLEVEL') ?? '0', 10) || 0,
    lotSize: parseInt(descMap.get('LOTSIZE') ?? '1', 10) || 1,
  }

  cacheSet('security:meta', ticker, security)
  return security
}

interface RawSearchResult {
  secid: string
  shortname: string
  name: string
  isin: string
  type: string
  group: string
  primary_boardid: string
}

const SEARCH_MAPPING = {
  secid: 'secid',
  shortname: 'shortname',
  name: 'name',
  isin: 'isin',
  type: 'type',
  group: 'group',
  primary_boardid: 'primary_boardid',
}

function searchResultToSecurity(row: RawSearchResult): Security {
  return {
    ticker: row.secid,
    isin: row.isin ?? '',
    name: row.name ?? row.shortname ?? row.secid,
    shortName: row.shortname ?? row.secid,
    type: inferType(row.primary_boardid ?? '', row.group ?? ''),
    currency: 'RUB',
    board: row.primary_boardid ?? 'TQBR',
    sector: row.type ?? '',
    listLevel: 0,
    lotSize: 1,
  }
}

export async function searchSecurities(query: string): Promise<Security[]> {
  if (query.length < 2) return []

  const url = securitySearchUrl(query)
  const response = await moexGet<Record<string, unknown>>(url)

  const block = extractBlock(response, 'securities')
  if (!block) return []

  const rows = parseBlock<RawSearchResult>(block, SEARCH_MAPPING)
  return rows
    .filter(r => r.secid && r.primary_boardid)
    .map(searchResultToSecurity)
}
