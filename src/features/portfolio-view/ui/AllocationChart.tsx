import type { AllocationBreakdown } from '../domain/models'
import { formatRub } from '../domain/formatters'

interface AllocationChartProps {
  data: AllocationBreakdown[]
  title: string
}

const COLORS = [
  '#1976d2', '#2e7d32', '#e65100', '#7b1fa2',
  '#c62828', '#00838f', '#f9a825', '#4e342e',
  '#37474f', '#ad1457',
]

export function AllocationChart({ data, title }: AllocationChartProps) {
  if (data.length === 0) return null

  return (
    <div className="allocation-section">
      <h3>{title}</h3>
      <div className="allocation-bar">
        {data.map((item, i) => (
          <div
            key={item.category}
            className="allocation-segment"
            style={{
              width: `${item.percent}%`,
              backgroundColor: COLORS[i % COLORS.length],
            }}
            title={`${item.category}: ${item.percent.toFixed(1)}%`}
          >
            {item.percent >= 8 ? `${item.percent.toFixed(0)}%` : ''}
          </div>
        ))}
      </div>
      <div className="allocation-legend">
        {data.map((item, i) => (
          <div key={item.category} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span>{item.category}</span>
            <span className="legend-value">
              {item.percent.toFixed(1)}% ({formatRub(item.value)})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
