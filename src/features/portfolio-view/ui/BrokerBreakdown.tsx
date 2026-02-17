import { useState } from 'react'
import type { BrokerAccount } from '../domain/models'
import { formatRub, formatPercent, gainClass, accountTypeLabel } from '../domain/formatters'

interface BrokerBreakdownProps {
  accounts: BrokerAccount[]
}

export function BrokerBreakdown({ accounts }: BrokerBreakdownProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (accounts.length === 0) {
    return (
      <div className="portfolio-empty">
        <p>Нет подключённых брокеров.</p>
      </div>
    )
  }

  function toggleExpand(key: string) {
    setExpanded(prev => prev === key ? null : key)
  }

  return (
    <div>
      {accounts.map(account => {
        const key = `${account.broker}-${account.accountType}`
        const isExpanded = expanded === key
        const gainPercent = account.totalValue > 0
          ? ((account.totalGain / (account.totalValue - account.totalGain)) * 100)
          : 0

        return (
          <div className="broker-section" key={key}>
            <div className="broker-card">
              <div className="broker-card-header" onClick={() => toggleExpand(key)}>
                <div className="broker-info">
                  <h4>
                    {account.displayName}
                    <span className="account-type-badge">
                      {accountTypeLabel(account.accountType)}
                    </span>
                  </h4>
                  <span className="broker-meta">
                    {account.positionCount} {positionWord(account.positionCount)}
                  </span>
                </div>
                <div className="broker-stats">
                  <div className="broker-value">{formatRub(account.totalValue)}</div>
                  <div className={`broker-gain ${gainClass(account.totalGain)}`}>
                    {formatRub(account.totalGain)} ({formatPercent(gainPercent)})
                  </div>
                </div>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </div>
              {isExpanded && (
                <div className="broker-positions">
                  <table>
                    <thead>
                      <tr>
                        <th>Тикер</th>
                        <th>Название</th>
                        <th>Кол-во</th>
                        <th>Стоимость</th>
                        <th>Прибыль</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.positions.map(p => (
                        <tr key={p.ticker}>
                          <td><strong>{p.ticker}</strong></td>
                          <td>{p.name}</td>
                          <td>{p.quantity}</td>
                          <td>{formatRub(p.currentValue)}</td>
                          <td className={gainClass(p.unrealizedGain)}>
                            {formatRub(p.unrealizedGain)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function positionWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'позиция'
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'позиции'
  return 'позиций'
}
