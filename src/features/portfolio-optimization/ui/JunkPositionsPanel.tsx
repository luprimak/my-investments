import type { JunkPositionReport } from '../domain/models'

interface JunkPositionsPanelProps {
  report: JunkPositionReport
}

const REASON_LABELS: Record<string, string> = {
  small_position: 'Мелкая позиция',
  deep_loss: 'Глубокий убыток',
  illiquid: 'Низкая ликвидность',
  delisted: 'Делистинг',
  duplicate: 'Дублирование',
}

export function JunkPositionsPanel({ report }: JunkPositionsPanelProps) {
  if (report.positions.length === 0) {
    return (
      <div className="junk-panel">
        <h3>Мусорные позиции</h3>
        <p className="no-data">Мусорных позиций не обнаружено.</p>
      </div>
    )
  }

  return (
    <div className="junk-panel">
      <h3>Мусорные позиции</h3>
      <p className="junk-summary">
        Обнаружено {report.positions.length} позиций на сумму{' '}
        <strong>{report.totalJunkValue.toLocaleString('ru-RU')} ₽</strong>
        {' '}({report.percentOfPortfolio}% портфеля)
      </p>

      <table className="junk-table">
        <thead>
          <tr>
            <th>Тикер</th>
            <th>Брокер</th>
            <th>Причина</th>
            <th>Стоимость</th>
            <th>Доля</th>
          </tr>
        </thead>
        <tbody>
          {report.positions.map(pos => (
            <tr key={`${pos.ticker}-${pos.broker}`}>
              <td><strong>{pos.ticker}</strong></td>
              <td>{pos.broker}</td>
              <td>{REASON_LABELS[pos.reason] ?? pos.reason}</td>
              <td>{pos.currentValue.toLocaleString('ru-RU')} ₽</td>
              <td>{pos.percentOfPortfolio}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
