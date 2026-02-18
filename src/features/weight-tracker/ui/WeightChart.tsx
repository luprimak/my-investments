import type { WeightEntry, WeightGoal } from '../domain/models'
import { formatDateShort } from '../domain/formatters'

interface WeightChartProps {
  entries: WeightEntry[]
  goal: WeightGoal
}

export function WeightChart({ entries, goal }: WeightChartProps) {
  if (entries.length < 2) {
    return (
      <div className="chart-section">
        <h3>График веса</h3>
        <p className="no-data">Нужно минимум 2 записи для отображения графика.</p>
      </div>
    )
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const weights = sorted.map(e => e.weight)
  const minW = Math.min(...weights, goal.targetWeight) - 1
  const maxW = Math.max(...weights, goal.startWeight) + 1
  const range = maxW - minW

  const padding = { top: 20, right: 20, bottom: 30, left: 45 }
  const width = 800
  const height = 200
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  function x(i: number): number {
    return padding.left + (i / (sorted.length - 1)) * plotW
  }

  function y(w: number): number {
    return padding.top + ((maxW - w) / range) * plotH
  }

  const linePath = sorted
    .map((e, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(e.weight).toFixed(1)}`)
    .join(' ')

  const areaPath = linePath
    + ` L${x(sorted.length - 1).toFixed(1)},${(padding.top + plotH).toFixed(1)}`
    + ` L${x(0).toFixed(1)},${(padding.top + plotH).toFixed(1)} Z`

  const goalY = y(goal.targetWeight)

  // Y-axis ticks
  const tickCount = 5
  const yTicks = Array.from({ length: tickCount }, (_, i) =>
    minW + (range * i) / (tickCount - 1)
  )

  // X-axis labels (show ~5 evenly spaced)
  const labelCount = Math.min(sorted.length, 6)
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i * (sorted.length - 1)) / (labelCount - 1))
  )

  return (
    <div className="chart-section">
      <h3>График веса</h3>
      <div className="chart-container">
        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {yTicks.map(tick => (
            <line
              key={tick}
              x1={padding.left}
              y1={y(tick)}
              x2={width - padding.right}
              y2={y(tick)}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map(tick => (
            <text
              key={`label-${tick}`}
              className="chart-label"
              x={padding.left - 8}
              y={y(tick) + 3}
              textAnchor="end"
            >
              {tick.toFixed(0)}
            </text>
          ))}

          {/* X-axis labels */}
          {labelIndices.map(idx => (
            <text
              key={`x-${idx}`}
              className="chart-label"
              x={x(idx)}
              y={height - 5}
              textAnchor="middle"
            >
              {formatDateShort(sorted[idx]!.date)}
            </text>
          ))}

          {/* Goal line */}
          <line
            className="chart-goal-line"
            x1={padding.left}
            y1={goalY}
            x2={width - padding.right}
            y2={goalY}
          />
          <text
            className="chart-goal-label"
            x={width - padding.right + 2}
            y={goalY + 3}
            textAnchor="start"
          >
            {goal.targetWeight}
          </text>

          {/* Area fill */}
          <path className="chart-area" d={areaPath} />

          {/* Line */}
          <path className="chart-line" d={linePath} />

          {/* Data points */}
          {sorted.map((e, i) => (
            <circle
              key={e.id}
              className="chart-dot"
              cx={x(i)}
              cy={y(e.weight)}
              r={3}
            >
              <title>{`${e.date}: ${e.weight} кг`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  )
}
