import type { TaxableTransaction } from '../domain/models'
import { useState } from 'react'

interface TransactionHistoryProps {
  transactions: TaxableTransaction[]
}

type FilterType = 'all' | 'dividend' | 'sale'

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter)

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}.${parts[1]}.${parts[0]}`
  }

  const formatAmount = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 })

  const totalAmount = sorted.reduce((s, t) => s + t.amount, 0)
  const totalTax = sorted.reduce((s, t) => s + t.taxAmount, 0)

  return (
    <div className="transaction-history-section">
      <div className="transaction-header">
        <h4 className="transaction-title">История операций</h4>
        <div className="transaction-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
          <button className={`filter-btn ${filter === 'dividend' ? 'active' : ''}`} onClick={() => setFilter('dividend')}>Дивиденды</button>
          <button className={`filter-btn ${filter === 'sale' ? 'active' : ''}`} onClick={() => setFilter('sale')}>Продажи</button>
        </div>
      </div>

      <div className="transaction-summary">
        <span>Операций: {sorted.length}</span>
        <span>Сумма: {formatAmount(totalAmount)} ₽</span>
        <span>Налоги: {formatAmount(totalTax)} ₽</span>
      </div>

      <table className="transaction-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тикер</th>
            <th>Тип</th>
            <th>Сумма</th>
            <th>Налог</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx, i) => (
            <tr key={i}>
              <td>{formatDate(tx.date)}</td>
              <td className="tx-ticker">{tx.ticker}</td>
              <td>
                <span className={`tx-type-badge ${tx.type}`}>
                  {tx.type === 'dividend' ? 'Дивиденды' : 'Продажа'}
                </span>
              </td>
              <td>{formatAmount(tx.amount)} ₽</td>
              <td>{formatAmount(tx.taxAmount)} ₽</td>
              <td>
                {tx.isExempt
                  ? <span className="tax-exempt-badge">{tx.exemptReason}</span>
                  : <span className="tax-paid-badge">Облагается</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
