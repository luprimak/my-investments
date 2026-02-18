import type { PositionReturn } from '../domain/models'

interface PositionReturnsProps {
  positions: PositionReturn[]
}

function formatRub(value: number): string {
  return value.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function returnClass(value: number): string {
  if (value > 0) return 'return-positive'
  if (value < 0) return 'return-negative'
  return 'return-neutral'
}

export function PositionReturns({ positions }: PositionReturnsProps) {
  const sorted = [...positions].sort((a, b) => b.absoluteReturn - a.absoluteReturn)

  return (
    <div className="position-returns">
      <h3>Доходность по позициям</h3>
      <table className="returns-table">
        <thead>
          <tr>
            <th>Тикер</th>
            <th>Название</th>
            <th className="col-right">Вложено</th>
            <th className="col-right">Стоимость</th>
            <th className="col-right">Доход</th>
            <th className="col-right">ROI %</th>
            <th className="col-right">Дивиденды</th>
            <th className="col-right">Комиссии</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(pos => (
            <tr key={pos.ticker}>
              <td><strong>{pos.ticker}</strong></td>
              <td>{pos.name}</td>
              <td className="col-right">{formatRub(pos.costBasis)}</td>
              <td className="col-right">{formatRub(pos.currentValue)}</td>
              <td className={`col-right ${returnClass(pos.absoluteReturn)}`}>
                {pos.absoluteReturn > 0 ? '+' : ''}{formatRub(pos.absoluteReturn)}
              </td>
              <td className={`col-right ${returnClass(pos.relativeReturn)}`}>
                {pos.relativeReturn > 0 ? '+' : ''}{pos.relativeReturn.toFixed(2)}%
              </td>
              <td className="col-right">
                {pos.dividendsReceived > 0 ? formatRub(pos.dividendsReceived) : '—'}
              </td>
              <td className="col-right">
                {pos.commissionsPaid > 0 ? formatRub(pos.commissionsPaid) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
