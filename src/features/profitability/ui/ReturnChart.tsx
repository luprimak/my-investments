import type { PositionReturn } from '../domain/models'

interface ReturnChartProps {
  positions: PositionReturn[]
}

export function ReturnChart({ positions }: ReturnChartProps) {
  if (positions.length === 0) return null

  const sorted = [...positions].sort((a, b) => b.relativeReturn - a.relativeReturn)
  const maxAbs = Math.max(
    ...sorted.map(p => Math.abs(p.relativeReturn)),
    1, // minimum to prevent division by zero
  )

  return (
    <div className="return-chart-section">
      <h3>Доходность по позициям (%)</h3>
      <div className="return-bar-chart">
        {sorted.map(pos => {
          const widthPercent = (Math.abs(pos.relativeReturn) / maxAbs) * 50
          const isPositive = pos.relativeReturn >= 0

          return (
            <div key={pos.ticker} className="bar-row">
              <span className="bar-label" title={pos.name}>{pos.ticker}</span>
              <div className="bar-track">
                <div className="bar-center" />
                <div
                  className={`bar-fill ${isPositive ? 'positive' : 'negative'}`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
              <span className={`bar-value ${isPositive ? 'return-positive' : 'return-negative'}`}>
                {isPositive ? '+' : ''}{pos.relativeReturn.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
