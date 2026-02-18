import { useState, useMemo } from 'react'
import type { Candle } from '../domain/models'
import { generateDemoHistory } from '../services/demo-data'

interface PriceChartProps {
  ticker: string
}

type ChartPeriod = '1W' | '1M' | '3M' | '6M' | '1Y'

const PERIOD_DAYS: Record<ChartPeriod, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
}

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  '1W': 'Неделя',
  '1M': 'Месяц',
  '3M': '3 мес',
  '6M': '6 мес',
  '1Y': 'Год',
}

const PERIODS: ChartPeriod[] = ['1W', '1M', '3M', '6M', '1Y']

const CHART_WIDTH = 600
const CHART_HEIGHT = 220
const PADDING = { top: 10, right: 10, bottom: 25, left: 55 }

export function PriceChart({ ticker }: PriceChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('3M')

  const candles = useMemo(
    () => generateDemoHistory(ticker, PERIOD_DAYS[period]),
    [ticker, period],
  )

  if (candles.length === 0) {
    return <div className="price-chart"><div className="no-selection">Нет данных</div></div>
  }

  const { linePath, areaPath, yLabels, xLabels, summary } = buildChart(candles)

  return (
    <div className="price-chart">
      <div className="chart-period-selector">
        {PERIODS.map(p => (
          <button
            key={p}
            className={`chart-period-btn ${p === period ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="chart-container">
        <svg className="chart-svg" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none">
          {yLabels.map(label => (
            <g key={label.y}>
              <line
                className="chart-grid-line"
                x1={PADDING.left}
                y1={label.y}
                x2={CHART_WIDTH - PADDING.right}
                y2={label.y}
              />
              <text className="chart-label" x={PADDING.left - 5} y={label.y + 3} textAnchor="end">
                {label.text}
              </text>
            </g>
          ))}

          {xLabels.map(label => (
            <text
              key={label.x}
              className="chart-label"
              x={label.x}
              y={CHART_HEIGHT - 5}
              textAnchor="middle"
            >
              {label.text}
            </text>
          ))}

          <path className="chart-area" d={areaPath} />
          <path className="chart-line" d={linePath} />
        </svg>
      </div>

      <div className="chart-summary">
        <div>Открытие: <span>{summary.open.toFixed(2)} ₽</span></div>
        <div>Макс: <span>{summary.high.toFixed(2)} ₽</span></div>
        <div>Мин: <span>{summary.low.toFixed(2)} ₽</span></div>
        <div>Закрытие: <span>{summary.close.toFixed(2)} ₽</span></div>
      </div>
    </div>
  )
}

interface Label { x?: number; y?: number; text: string }
interface ChartData {
  linePath: string
  areaPath: string
  yLabels: (Label & { y: number })[]
  xLabels: (Label & { x: number })[]
  summary: { open: number; high: number; low: number; close: number }
}

function buildChart(candles: Candle[]): ChartData {
  const plotW = CHART_WIDTH - PADDING.left - PADDING.right
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const closes = candles.map(c => c.close)
  const minPrice = Math.min(...closes)
  const maxPrice = Math.max(...closes)
  const range = maxPrice - minPrice || 1

  const xScale = (i: number) => PADDING.left + (i / (candles.length - 1)) * plotW
  const yScale = (v: number) => PADDING.top + plotH - ((v - minPrice) / range) * plotH

  const points = candles.map((c, i) => ({ x: xScale(i), y: yScale(c.close) }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1]!.x} ${PADDING.top + plotH} L ${points[0]!.x} ${PADDING.top + plotH} Z`

  const yLabelCount = 5
  const yLabels: (Label & { y: number })[] = []
  for (let i = 0; i <= yLabelCount; i++) {
    const value = minPrice + (range * i) / yLabelCount
    yLabels.push({ y: yScale(value), text: value >= 100 ? value.toFixed(0) : value.toFixed(2) })
  }

  const xLabelCount = Math.min(5, candles.length - 1)
  const xLabels: (Label & { x: number })[] = []
  for (let i = 0; i <= xLabelCount; i++) {
    const idx = Math.round((i / xLabelCount) * (candles.length - 1))
    const candle = candles[idx]!
    const date = new Date(candle.date)
    xLabels.push({
      x: xScale(idx),
      text: `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`,
    })
  }

  const allHighs = candles.map(c => c.high)
  const allLows = candles.map(c => c.low)

  return {
    linePath,
    areaPath,
    yLabels,
    xLabels,
    summary: {
      open: candles[0]!.open,
      high: Math.max(...allHighs),
      low: Math.min(...allLows),
      close: candles[candles.length - 1]!.close,
    },
  }
}
