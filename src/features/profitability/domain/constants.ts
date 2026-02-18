import type { ReturnPeriod } from './models'

export const AVAILABLE_PERIODS: ReturnPeriod[] = ['day', 'week', 'month', 'year', 'all']

export const DEFAULT_PERIOD: ReturnPeriod = 'all'

export const PERIOD_LABELS: Record<ReturnPeriod, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
  year: 'Год',
  all: 'Всё время',
}

export const PERIOD_DAYS: Record<ReturnPeriod, number | null> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
  all: null,
}

export const NDFL_RATE = 0.13
