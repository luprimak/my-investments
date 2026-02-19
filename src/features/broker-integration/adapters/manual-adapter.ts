import type { Portfolio, Transaction, BrokerCapabilities, Position, CashBalance } from '../domain/models'
import type { IBrokerAdapter, ConnectionResult } from './broker-adapter'

const STORAGE_KEY = 'broker:manual:positions'
const CASH_KEY = 'broker:manual:cash'

export class ManualAdapter implements IBrokerAdapter {
  brokerType = 'manual' as const
  capabilities: BrokerCapabilities = {
    supportsRealTimeSync: false,
    supportsTransactionHistory: false,
    supportsDividendInfo: false,
    supportsReportImport: false,
    supportedReportFormats: [],
    maxRequestsPerMinute: 0,
  }

  private brokerId: string

  constructor(brokerId: string) {
    this.brokerId = brokerId
  }

  async connect(): Promise<ConnectionResult> {
    return { success: true, brokerId: this.brokerId }
  }

  async disconnect(): Promise<void> {
    // Manual adapter has no connection to close
  }

  async validateConnection(): Promise<boolean> {
    return true
  }

  async getPortfolio(): Promise<Portfolio> {
    const positions = this.loadPositions()
    const cash = this.loadCash()
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0)
      + cash.reduce((sum, c) => sum + c.amount, 0)

    return {
      brokerId: this.brokerId,
      broker: 'manual',
      positions,
      cash,
      totalValue,
      syncedAt: new Date().toISOString(),
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    return []
  }

  addPosition(position: Position): void {
    const positions = this.loadPositions()
    const existing = positions.findIndex(p => p.ticker === position.ticker)
    if (existing >= 0) {
      positions[existing] = position
    } else {
      positions.push(position)
    }
    this.savePositions(positions)
  }

  removePosition(ticker: string): void {
    const positions = this.loadPositions().filter(p => p.ticker !== ticker)
    this.savePositions(positions)
  }

  updateCash(cash: CashBalance[]): void {
    try {
      localStorage.setItem(`${CASH_KEY}:${this.brokerId}`, JSON.stringify(cash))
    } catch {
      // localStorage unavailable
    }
  }

  private loadPositions(): Position[] {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}:${this.brokerId}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private savePositions(positions: Position[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY}:${this.brokerId}`, JSON.stringify(positions))
    } catch {
      // localStorage unavailable
    }
  }

  private loadCash(): CashBalance[] {
    try {
      const data = localStorage.getItem(`${CASH_KEY}:${this.brokerId}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }
}
