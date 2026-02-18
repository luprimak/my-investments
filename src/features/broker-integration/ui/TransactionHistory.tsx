import type { Transaction } from '../domain/models'

interface TransactionHistoryProps {
  transactions: Transaction[]
}

const TYPE_LABELS: Record<string, string> = {
  buy: 'Покупка',
  sell: 'Продажа',
  dividend: 'Дивиденд',
  coupon: 'Купон',
  commission: 'Комиссия',
  tax: 'Налог',
  transfer_in: 'Зачисл.',
  transfer_out: 'Списание',
}

const INCOME_TYPES = new Set(['sell', 'dividend', 'coupon', 'transfer_in'])

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function formatAmount(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="transactions-section">
      <h3>История операций</h3>
      <div className="transaction-list">
        {sorted.map(tx => {
          const isIncome = INCOME_TYPES.has(tx.type)
          return (
            <div key={tx.id} className="transaction-item">
              <span className="tx-date">{formatDate(tx.date)}</span>
              <span className={`tx-type ${tx.type}`}>
                {TYPE_LABELS[tx.type] ?? tx.type}
              </span>
              <span className="tx-description">{tx.description}</span>
              <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                {isIncome ? '+' : '-'}{formatAmount(tx.amount)} ₽
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
