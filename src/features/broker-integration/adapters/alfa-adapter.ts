import type { Portfolio, Transaction, BrokerCapabilities } from '../domain/models'
import type { IBrokerAdapter, ConnectionResult } from './broker-adapter'

export class AlfaAdapter implements IBrokerAdapter {
  brokerType = 'alfa' as const
  capabilities: BrokerCapabilities = {
    supportsRealTimeSync: false,
    supportsTransactionHistory: false,
    supportsDividendInfo: false,
    supportsReportImport: true,
    supportedReportFormats: ['xlsx'],
    maxRequestsPerMinute: 0,
  }

  private brokerId: string
  private portfolio: Portfolio | null = null

  constructor(brokerId: string) {
    this.brokerId = brokerId
  }

  async connect(): Promise<ConnectionResult> {
    return { success: true, brokerId: this.brokerId }
  }

  async disconnect(): Promise<void> {
    this.portfolio = null
  }

  async validateConnection(): Promise<boolean> {
    return true
  }

  async getPortfolio(): Promise<Portfolio> {
    if (this.portfolio) return this.portfolio
    return {
      brokerId: this.brokerId,
      broker: 'alfa',
      positions: [],
      cash: [],
      totalValue: 0,
      syncedAt: new Date().toISOString(),
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return []
  }

  setPortfolioFromImport(portfolio: Portfolio): void {
    this.portfolio = portfolio
  }
}
