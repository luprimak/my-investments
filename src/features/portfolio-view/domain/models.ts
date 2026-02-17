export type BrokerName = 'sberbank' | 'alfa' | 'tbank' | 'vtb'
export type AccountType = 'standard' | 'iis' | 'trust_management' | 'auto_managed'
export type AssetClass = 'stock' | 'bond' | 'etf' | 'currency' | 'other'
export type AssetSubclass = 'common' | 'preferred' | 'ofz' | 'corporate' | 'municipal'

export interface ViewPosition {
  ticker: string
  name: string
  broker: BrokerName
  accountType: AccountType
  assetClass: AssetClass
  assetSubclass?: AssetSubclass
  sector: string
  currency: 'RUB'
  quantity: number
  currentPrice: number
  currentValue: number
  costBasis: number
  purchaseDate: string
  dailyVolume: number
  unrealizedGain: number
  unrealizedGainPercent: number
  portfolioWeight: number
}

export interface BrokerAccount {
  broker: BrokerName
  displayName: string
  accountType: AccountType
  positions: ViewPosition[]
  totalValue: number
  totalGain: number
  positionCount: number
}

export interface AllocationBreakdown {
  category: string
  percent: number
  value: number
}

export interface PortfolioMetrics {
  totalValue: number
  totalCostBasis: number
  totalGain: number
  totalGainPercent: number
  positionCount: number
  brokerCount: number
  allocationByAssetClass: AllocationBreakdown[]
  allocationBySector: AllocationBreakdown[]
  topHoldings: ViewPosition[]
}

export type SortField = 'ticker' | 'name' | 'broker' | 'assetClass' | 'quantity' | 'currentPrice' | 'currentValue' | 'unrealizedGain' | 'portfolioWeight'
export type SortDirection = 'asc' | 'desc'
