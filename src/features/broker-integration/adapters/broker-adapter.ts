import type { BrokerType, Portfolio, Transaction, BrokerCapabilities } from '../domain/models'

export interface ConnectionResult {
  success: boolean
  brokerId?: string
  error?: string
}

export interface IBrokerAdapter {
  brokerType: BrokerType
  capabilities: BrokerCapabilities

  connect(credentials: Record<string, string>): Promise<ConnectionResult>
  disconnect(): Promise<void>
  validateConnection(): Promise<boolean>

  getPortfolio(): Promise<Portfolio>
  getTransactions(from: string, to: string): Promise<Transaction[]>
}
