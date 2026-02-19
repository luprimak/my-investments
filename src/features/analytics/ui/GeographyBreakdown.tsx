import type { GeographyBreakdown as GeographyBreakdownType } from '../domain/models'
import { GEOGRAPHY_REGIONS } from '../domain/constants'

interface GeographyBreakdownProps {
  data: GeographyBreakdownType[]
}

export function GeographyBreakdown({ data }: GeographyBreakdownProps) {
  if (data.length === 0) {
    return <div className="chart-empty">Нет данных</div>
  }

  const maxPercent = Math.max(...data.map(d => d.percent))

  return (
    <div className="geography-section">
      <h4 className="geography-title">Географическое распределение</h4>
      <div className="geography-bars">
        {data.map(item => (
          <div key={item.region} className="geography-bar-row">
            <span className="geography-label">{item.region}</span>
            <div className="geography-bar-track">
              <div
                className="geography-bar-fill"
                style={{
                  width: `${(item.percent / maxPercent) * 100}%`,
                  backgroundColor: GEOGRAPHY_REGIONS[item.region] ?? '#757575',
                }}
              />
            </div>
            <span className="geography-value">{item.percent.toFixed(1)}%</span>
            <span className="geography-amount">{item.value.toLocaleString('ru-RU')} ₽</span>
          </div>
        ))}
      </div>
    </div>
  )
}
