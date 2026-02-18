export type BrokerType = 'tbank' | 'alfa' | 'sberbank' | 'vtb' | 'manual'

export type ConnectionType = 'api' | 'manual' | 'import'

export type ConnectionStatus = 'active' | 'disconnected' | 'error' | 'pending_auth'

export type SyncStatus = 'success' | 'partial' | 'failed'

export type InstrumentType = 'stock' | 'bond' | 'etf' | 'currency' | 'other'

export type TransactionType =
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'coupon'
  | 'commission'
  | 'tax'
  | 'transfer_in'
  | 'transfer_out'

export type Currency = 'RUB' | 'USD' | 'EUR'

export interface BrokerConnection {
  id: string
  broker: BrokerType
  displayName: string
  connectionType: ConnectionType
  status: ConnectionStatus
  lastSyncAt: string | null
  lastSyncStatus: SyncStatus | null
  createdAt: string
}

export interface Position {
  ticker: string
  isin: string
  name: string
  instrumentType: InstrumentType
  quantity: number
  averagePrice: number
  currentPrice: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  currency: Currency
  nkd?: number
  maturityDate?: string
}

export interface CashBalance {
  currency: Currency
  amount: number
}

export interface Portfolio {
  brokerId: string
  broker: BrokerType
  positions: Position[]
  cash: CashBalance[]
  totalValue: number
  syncedAt: string
}

export interface Transaction {
  id: string
  brokerId: string
  date: string
  type: TransactionType
  ticker?: string
  quantity?: number
  price?: number
  amount: number
  currency: Currency
  description: string
}

export interface BrokerHolding {
  broker: BrokerType
  brokerId: string
  quantity: number
  averagePrice: number
  currentValue: number
}

export interface ConsolidatedPosition {
  ticker: string
  name: string
  instrumentType: InstrumentType
  holdings: BrokerHolding[]
  totalQuantity: number
  weightedAveragePrice: number
  totalValue: number
  totalPnL: number
}

export interface AggregatedPortfolio {
  brokers: Portfolio[]
  consolidatedPositions: ConsolidatedPosition[]
  totalValue: number
  totalPnL: number
  syncedAt: string
}

export interface SyncResult {
  brokerId: string
  broker: BrokerType
  status: 'success' | 'failed'
  error?: string
  syncedAt: string
}

export interface BrokerCapabilities {
  supportsRealTimeSync: boolean
  supportsTransactionHistory: boolean
  supportsDividendInfo: boolean
  supportsReportImport: boolean
  supportedReportFormats: string[]
  maxRequestsPerMinute: number
}
