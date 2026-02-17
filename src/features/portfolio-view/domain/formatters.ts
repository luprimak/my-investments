import type { AssetClass, BrokerName, AccountType } from './models'

export function formatRub(value: number): string {
  return value.toLocaleString('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function gainClass(value: number): string {
  if (value > 0) return 'gain-positive'
  if (value < 0) return 'gain-negative'
  return 'gain-neutral'
}

export function assetClassLabel(assetClass: AssetClass): string {
  const labels: Record<AssetClass, string> = {
    stock: 'Акции',
    bond: 'Облигации',
    etf: 'ETF',
    currency: 'Валюта',
    other: 'Прочее',
  }
  return labels[assetClass]
}

export function brokerLabel(broker: BrokerName): string {
  const labels: Record<BrokerName, string> = {
    sberbank: 'Сбербанк Инвестиции',
    alfa: 'Альфа-Инвестиции',
    tbank: 'Т-Инвестиции',
    vtb: 'ВТБ Мои Инвестиции',
  }
  return labels[broker]
}

export function accountTypeLabel(accountType: AccountType): string {
  const labels: Record<AccountType, string> = {
    standard: 'Брокерский счёт',
    iis: 'ИИС',
    trust_management: 'ПДС (доверительное управление)',
    auto_managed: 'Инвест-копилка',
  }
  return labels[accountType]
}
