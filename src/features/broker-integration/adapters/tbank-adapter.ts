import type { Portfolio, Transaction, BrokerCapabilities, Position } from '../domain/models'
import type { IBrokerAdapter, ConnectionResult } from './broker-adapter'

export class TBankAdapter implements IBrokerAdapter {
  brokerType = 'tbank' as const
  capabilities: BrokerCapabilities = {
    supportsRealTimeSync: true,
    supportsTransactionHistory: true,
    supportsDividendInfo: true,
    supportsReportImport: true,
    supportedReportFormats: ['xlsx', 'csv'],
    maxRequestsPerMinute: 120,
  }

  private brokerId: string
  private token: string | null = null
  private connected = false

  constructor(brokerId: string) {
    this.brokerId = brokerId
  }

  async connect(credentials: Record<string, string>): Promise<ConnectionResult> {
    const token = credentials['token']
    if (!token) {
      return { success: false, error: 'Токен API не указан' }
    }

    // In production: validate token against T-Bank API
    // For now: accept any non-empty token
    this.token = token
    this.connected = true
    return { success: true, brokerId: this.brokerId }
  }

  async disconnect(): Promise<void> {
    this.token = null
    this.connected = false
  }

  async validateConnection(): Promise<boolean> {
    return this.connected && this.token !== null
  }

  async getPortfolio(): Promise<Portfolio> {
    if (!this.connected) throw new Error('Не подключено к Т-Инвестиции')

    // In production: call T-Bank Invest API v2
    // GET /portfolio with auth header
    // For now: return structure ready for real API integration
    const positions: Position[] = []
    return {
      brokerId: this.brokerId,
      broker: 'tbank',
      positions,
      cash: [{ currency: 'RUB', amount: 0 }],
      totalValue: 0,
      syncedAt: new Date().toISOString(),
    }
  }

  async getTransactions(from: string, to: string): Promise<Transaction[]> {
    if (!this.connected) throw new Error('Не подключено к Т-Инвестиции')

    // In production: call T-Bank Operations API
    void from
    void to
    return []
  }
}
