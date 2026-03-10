import type { BenchmarkComparison as BenchmarkComparisonType } from '../domain/models'

interface BenchmarkComparisonProps {
  comparison: BenchmarkComparisonType
}

export function BenchmarkComparison({ comparison }: BenchmarkComparisonProps) {
  const { portfolioSeries, benchmarkSeries } = comparison

  if (portfolioSeries.points.length < 2 || benchmarkSeries.points.length < 2) {
    return <div className="chart-empty">Недостаточно данных для сравнения</div>
  }

  const width = 700
  const height = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const allValues = [...portfolioSeries.points.map(p => p.value), ...benchmarkSeries.points.map(p => p.value)]
  const minVal = Math.min(...allValues) * 0.98
  const maxVal = Math.max(...allValues) * 1.02
  const valueRange = maxVal - minVal || 1

  const maxLen = Math.max(portfolioSeries.points.length, benchmarkSeries.points.length)
  const scaleX = (i: number, total: number) => padding.left + (i / (total - 1)) * chartW
  const scaleY = (v: number) => padding.top + chartH - ((v - minVal) / valueRange) * chartH

  const portfolioLine = portfolioSeries.points
    .map((p, i) => `${scaleX(i, portfolioSeries.points.length)},${scaleY(p.value)}`)
    .join(' ')

  const benchmarkLine = benchmarkSeries.points
    .map((p, i) => `${scaleX(i, benchmarkSeries.points.length)},${scaleY(p.value)}`)
    .join(' ')

  const yTicks = 5
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const val = minVal + (valueRange * i) / (yTicks - 1)
    return { value: val, y: scaleY(val) }
  })

  const alphaClass = comparison.alpha >= 0 ? 'positive' : 'negative'
  const alphaSign = comparison.alpha >= 0 ? '+' : ''

  return (
    <div className="benchmark-section">
      <div className="benchmark-stats">
        <div className="benchmark-stat">
          <span className="benchmark-stat-label">Портфель</span>
          <span className={`benchmark-stat-value ${comparison.portfolioReturn >= 0 ? 'positive' : 'negative'}`}>
            {comparison.portfolioReturn >= 0 ? '+' : ''}{comparison.portfolioReturn.toFixed(2)}%
          </span>
        </div>
        <div className="benchmark-stat">
          <span className="benchmark-stat-label">{comparison.benchmarkName}</span>
          <span className={`benchmark-stat-value ${comparison.benchmarkReturn >= 0 ? 'positive' : 'negative'}`}>
            {comparison.benchmarkReturn >= 0 ? '+' : ''}{comparison.benchmarkReturn.toFixed(2)}%
          </span>
        </div>
        <div className="benchmark-stat">
          <span className="benchmark-stat-label">Альфа</span>
          <span className={`benchmark-stat-value ${alphaClass}`}>
            {alphaSign}{comparison.alpha.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="benchmark-chart">
          {yLabels.map((tick, i) => (
            <g key={i}>
              <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#e0e0e0" strokeWidth="1" />
              <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#999">
                {tick.value.toFixed(0)}
              </text>
            </g>
          ))}
          <polyline points={benchmarkLine} fill="none" stroke="#ff9800" strokeWidth="2" strokeDasharray="6 3" />
          <polyline points={portfolioLine} fill="none" stroke="#1976d2" strokeWidth="2" />
        </svg>
      </div>
      <div className="benchmark-legend">
        <span className="legend-item"><span className="legend-line" style={{ backgroundColor: '#1976d2' }} /> Портфель</span>
        <span className="legend-item"><span className="legend-line legend-line-dashed" style={{ backgroundColor: '#ff9800' }} /> {comparison.benchmarkName}</span>
      </div>
    </div>
  )
}
