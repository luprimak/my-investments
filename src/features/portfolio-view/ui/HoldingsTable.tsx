import { useState } from 'react'
import type { ViewPosition, SortField, SortDirection } from '../domain/models'
import { formatRub, formatPercent, gainClass, assetClassLabel, brokerLabel } from '../domain/formatters'

interface HoldingsTableProps {
  positions: ViewPosition[]
}

export function HoldingsTable({ positions }: HoldingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('portfolioWeight')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = [...positions].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    const numA = Number(aVal)
    const numB = Number(bVal)
    return sortDir === 'asc' ? numA - numB : numB - numA
  })

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null
    return <span className="sort-indicator">{sortDir === 'asc' ? '▲' : '▼'}</span>
  }

  if (positions.length === 0) {
    return (
      <div className="portfolio-empty">
        <p>Нет позиций для отображения.</p>
      </div>
    )
  }

  return (
    <table className="holdings-table">
      <thead>
        <tr>
          <th onClick={() => handleSort('ticker')}>Тикер{sortIndicator('ticker')}</th>
          <th onClick={() => handleSort('name')}>Название{sortIndicator('name')}</th>
          <th onClick={() => handleSort('broker')}>Брокер{sortIndicator('broker')}</th>
          <th onClick={() => handleSort('assetClass')}>Класс{sortIndicator('assetClass')}</th>
          <th className="col-right" onClick={() => handleSort('quantity')}>Кол-во{sortIndicator('quantity')}</th>
          <th className="col-right" onClick={() => handleSort('currentPrice')}>Цена{sortIndicator('currentPrice')}</th>
          <th className="col-right" onClick={() => handleSort('currentValue')}>Стоимость{sortIndicator('currentValue')}</th>
          <th className="col-right" onClick={() => handleSort('unrealizedGain')}>Прибыль{sortIndicator('unrealizedGain')}</th>
          <th className="col-right" onClick={() => handleSort('portfolioWeight')}>% портфеля{sortIndicator('portfolioWeight')}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map(p => (
          <tr key={`${p.broker}-${p.ticker}`}>
            <td><strong>{p.ticker}</strong></td>
            <td>{p.name}</td>
            <td>{brokerLabel(p.broker)}</td>
            <td>{assetClassLabel(p.assetClass)}</td>
            <td className="col-right">{p.quantity}</td>
            <td className="col-right">{formatRub(p.currentPrice)}</td>
            <td className="col-right">{formatRub(p.currentValue)}</td>
            <td className={`col-right ${gainClass(p.unrealizedGain)}`}>
              {formatRub(p.unrealizedGain)} ({formatPercent(p.unrealizedGainPercent)})
            </td>
            <td className="col-right">{p.portfolioWeight.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
