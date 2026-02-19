import type { TimeSeries } from '../domain/models'
import { useState } from 'react'

interface PortfolioValueChartProps {
  series: TimeSeries
}

export function PortfolioValueChart({ series }: PortfolioValueChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; value: number } | null>(null)

  if (series.points.length < 2) {
    return <div className="chart-empty">Недостаточно данных для графика</div>
  }

  const width = 700
  const height = 300
  const padding = { top: 20, right: 20, bottom: 40, left: 70 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const values = series.points.map(p => p.value)
  const minVal = Math.min(...values) * 0.98
  const maxVal = Math.max(...values) * 1.02
  const valueRange = maxVal - minVal || 1

  const scaleX = (i: number) => padding.left + (i / (series.points.length - 1)) * chartW
  const scaleY = (v: number) => padding.top + chartH - ((v - minVal) / valueRange) * chartH

  const polylinePoints = series.points.map((p, i) => `${scaleX(i)},${scaleY(p.value)}`).join(' ')

  const gradientPoints = [
    `${scaleX(0)},${padding.top + chartH}`,
    ...series.points.map((p, i) => `${scaleX(i)},${scaleY(p.value)}`),
    `${scaleX(series.points.length - 1)},${padding.top + chartH}`,
  ].join(' ')

  const yTicks = 5
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const val = minVal + (valueRange * i) / (yTicks - 1)
    return { value: val, y: scaleY(val) }
  })

  const xLabelCount = Math.min(6, series.points.length)
  const xStep = Math.max(1, Math.floor(series.points.length / xLabelCount))
  const xLabels = series.points
    .filter((_, i) => i % xStep === 0 || i === series.points.length - 1)
    .map((p, _, arr) => {
      const idx = series.points.indexOf(p)
      return { date: p.date, x: scaleX(idx) }
    })

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * width
    const idx = Math.round(((mouseX - padding.left) / chartW) * (series.points.length - 1))
    const clamped = Math.max(0, Math.min(series.points.length - 1, idx))
    const point = series.points[clamped]!
    setTooltip({ x: scaleX(clamped), y: scaleY(point.value), date: point.date, value: point.value })
  }

  const formatValue = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 })
  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}.${parts[1]}`
  }

  return (
    <div className="chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="portfolio-chart"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {yLabels.map((tick, i) => (
          <g key={i}>
            <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#e0e0e0" strokeWidth="1" />
            <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="#999">
              {formatValue(tick.value)}
            </text>
          </g>
        ))}
        {xLabels.map((tick, i) => (
          <text key={i} x={tick.x} y={height - 8} textAnchor="middle" fontSize="11" fill="#999">
            {formatDate(tick.date)}
          </text>
        ))}
        <polygon points={gradientPoints} fill="#1976d2" opacity="0.1" />
        <polyline points={polylinePoints} fill="none" stroke="#1976d2" strokeWidth="2" />
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={padding.top + chartH} stroke="#1976d2" strokeWidth="1" strokeDasharray="4" />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#1976d2" />
            <rect x={tooltip.x - 60} y={tooltip.y - 38} width="120" height="30" rx="4" fill="#333" />
            <text x={tooltip.x} y={tooltip.y - 24} textAnchor="middle" fontSize="10" fill="#fff">
              {formatDate(tooltip.date)} — {formatValue(tooltip.value)} ₽
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
