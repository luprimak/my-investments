import type { AllocationBreakdown } from '../domain/models'

interface AllocationPieChartProps {
  data: AllocationBreakdown[]
  title: string
}

export function AllocationPieChart({ data, title }: AllocationPieChartProps) {
  if (data.length === 0) {
    return <div className="chart-empty">Нет данных</div>
  }

  const gradientStops: string[] = []
  let accumulated = 0
  for (const item of data) {
    const start = accumulated
    accumulated += item.percent
    gradientStops.push(`${item.color} ${start}% ${accumulated}%`)
  }

  const pieStyle = {
    background: `conic-gradient(${gradientStops.join(', ')})`,
  }

  return (
    <div className="pie-chart-section">
      <h4 className="pie-chart-title">{title}</h4>
      <div className="pie-chart-layout">
        <div className="pie-chart" style={pieStyle} />
        <div className="pie-legend">
          {data.map(item => (
            <div key={item.category} className="pie-legend-item">
              <span className="pie-legend-dot" style={{ backgroundColor: item.color }} />
              <span className="pie-legend-label">{item.category}</span>
              <span className="pie-legend-value">{item.percent.toFixed(1)}%</span>
              <span className="pie-legend-amount">{item.value.toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
