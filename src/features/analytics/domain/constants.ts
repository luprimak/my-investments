export { NDFL_RATE, NDFL_HIGH_RATE, NDFL_HIGH_INCOME_THRESHOLD, TAX_EXEMPT_HOLDING_YEARS } from '@/features/portfolio-optimization/domain/constants'

export const TRADING_DAYS_PER_YEAR = 252

export const RISK_FREE_RATE = 0.16

export const BENCHMARK_IMOEX = {
  id: 'IMOEX' as const,
  name: 'Индекс МосБиржи',
}

export const ANALYSIS_PERIODS = {
  '1M': { label: '1М', days: 30 },
  '3M': { label: '3М', days: 90 },
  '6M': { label: '6М', days: 180 },
  '1Y': { label: '1Г', days: 365 },
  'YTD': { label: 'С нач. года', days: 0 },
  'ALL': { label: 'Всё', days: 0 },
} as const

export const ASSET_CLASS_COLORS: Record<string, string> = {
  'Акции': '#1976d2',
  'Облигации': '#2e7d32',
  'ETF': '#f57c00',
  'Валюта': '#7b1fa2',
  'Прочее': '#757575',
}

export const SECTOR_COLORS: Record<string, string> = {
  'Финансы': '#1976d2',
  'Нефть и газ': '#2e7d32',
  'Технологии': '#f57c00',
  'Металлургия': '#7b1fa2',
  'Потребительский': '#00838f',
  'Гос. облигации': '#5d4037',
  'Облигации': '#455a64',
  'Широкий рынок': '#e65100',
  'Денежный рынок': '#1b5e20',
}

export const GEOGRAPHY_REGIONS: Record<string, string> = {
  'Россия': '#1976d2',
  'США': '#f44336',
  'Китай': '#ff9800',
  'Европа': '#4caf50',
  'Прочее': '#757575',
}

export const CORRELATION_COLORS = {
  strongPositive: '#1b5e20',
  positive: '#66bb6a',
  neutral: '#e0e0e0',
  negative: '#ef5350',
  strongNegative: '#b71c1c',
} as const
