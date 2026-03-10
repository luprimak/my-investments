import type { CorrelationMatrix as CorrelationMatrixType } from '../domain/models'

interface CorrelationMatrixProps {
  matrix: CorrelationMatrixType
}

function getCorrelationColor(value: number): string {
  if (value >= 0.7) return '#1b5e20'
  if (value >= 0.3) return '#66bb6a'
  if (value >= -0.3) return '#e0e0e0'
  if (value >= -0.7) return '#ef5350'
  return '#b71c1c'
}

function getTextColor(value: number): string {
  if (Math.abs(value) >= 0.7) return '#fff'
  if (Math.abs(value) >= 0.3) return '#333'
  return '#333'
}

export function CorrelationMatrix({ matrix }: CorrelationMatrixProps) {
  if (matrix.tickers.length === 0) {
    return <div className="chart-empty">Недостаточно данных для корреляций</div>
  }

  return (
    <div className="correlation-section">
      <h4 className="correlation-title">Корреляционная матрица</h4>
      <div className="correlation-grid" style={{
        gridTemplateColumns: `60px repeat(${matrix.tickers.length}, 1fr)`,
      }}>
        <div className="correlation-corner" />
        {matrix.tickers.map(t => (
          <div key={`h-${t}`} className="correlation-header">{t}</div>
        ))}
        {matrix.tickers.map((rowTicker, i) => (
          <>
            <div key={`r-${rowTicker}`} className="correlation-row-label">{rowTicker}</div>
            {matrix.values[i]!.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="correlation-cell"
                style={{
                  backgroundColor: getCorrelationColor(val),
                  color: getTextColor(val),
                }}
              >
                {val.toFixed(2)}
              </div>
            ))}
          </>
        ))}
      </div>
      <div className="correlation-legend">
        <span className="correlation-legend-item">
          <span className="correlation-dot" style={{ backgroundColor: '#1b5e20' }} /> Сильная +
        </span>
        <span className="correlation-legend-item">
          <span className="correlation-dot" style={{ backgroundColor: '#66bb6a' }} /> Слабая +
        </span>
        <span className="correlation-legend-item">
          <span className="correlation-dot" style={{ backgroundColor: '#e0e0e0' }} /> Нейтральная
        </span>
        <span className="correlation-legend-item">
          <span className="correlation-dot" style={{ backgroundColor: '#ef5350' }} /> Слабая −
        </span>
        <span className="correlation-legend-item">
          <span className="correlation-dot" style={{ backgroundColor: '#b71c1c' }} /> Сильная −
        </span>
      </div>
    </div>
  )
}
