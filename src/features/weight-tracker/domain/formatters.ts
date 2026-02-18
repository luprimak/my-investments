export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} кг`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatRate(rate: number): string {
  const sign = rate > 0 ? '+' : ''
  return `${sign}${rate.toFixed(2)} кг/нед`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]!
}

export function changeClass(value: number): string {
  if (value < 0) return 'change-good' // losing weight = good
  if (value > 0) return 'change-bad'
  return 'change-neutral'
}
