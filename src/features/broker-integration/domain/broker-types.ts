import type { BrokerType, BrokerCapabilities } from './models'

export interface BrokerMeta {
  type: BrokerType
  displayName: string
  shortName: string
  description: string
  color: string
  capabilities: BrokerCapabilities
}

export const BROKER_META: Record<BrokerType, BrokerMeta> = {
  tbank: {
    type: 'tbank',
    displayName: 'Т-Инвестиции',
    shortName: 'Т-Банк',
    description: 'Полная интеграция через API Т-Инвестиций',
    color: '#FFDD2D',
    capabilities: {
      supportsRealTimeSync: true,
      supportsTransactionHistory: true,
      supportsDividendInfo: true,
      supportsReportImport: true,
      supportedReportFormats: ['xlsx', 'csv'],
      maxRequestsPerMinute: 120,
    },
  },
  alfa: {
    type: 'alfa',
    displayName: 'Альфа-Инвестиции',
    shortName: 'Альфа',
    description: 'Импорт отчётов или ручной ввод',
    color: '#EF3124',
    capabilities: {
      supportsRealTimeSync: false,
      supportsTransactionHistory: false,
      supportsDividendInfo: false,
      supportsReportImport: true,
      supportedReportFormats: ['xlsx'],
      maxRequestsPerMinute: 0,
    },
  },
  sberbank: {
    type: 'sberbank',
    displayName: 'Сбербанк Инвестиции',
    shortName: 'Сбер',
    description: 'Импорт отчётов или ручной ввод',
    color: '#21A038',
    capabilities: {
      supportsRealTimeSync: false,
      supportsTransactionHistory: false,
      supportsDividendInfo: false,
      supportsReportImport: true,
      supportedReportFormats: ['xlsx'],
      maxRequestsPerMinute: 0,
    },
  },
  vtb: {
    type: 'vtb',
    displayName: 'ВТБ Мои Инвестиции',
    shortName: 'ВТБ',
    description: 'Импорт отчётов или ручной ввод',
    color: '#003DA5',
    capabilities: {
      supportsRealTimeSync: false,
      supportsTransactionHistory: false,
      supportsDividendInfo: false,
      supportsReportImport: true,
      supportedReportFormats: ['xlsx'],
      maxRequestsPerMinute: 0,
    },
  },
  manual: {
    type: 'manual',
    displayName: 'Ручной ввод',
    shortName: 'Вручную',
    description: 'Ручной ввод позиций портфеля',
    color: '#757575',
    capabilities: {
      supportsRealTimeSync: false,
      supportsTransactionHistory: false,
      supportsDividendInfo: false,
      supportsReportImport: false,
      supportedReportFormats: [],
      maxRequestsPerMinute: 0,
    },
  },
}

export const BROKER_LIST: BrokerType[] = ['tbank', 'alfa', 'sberbank', 'vtb', 'manual']

export function getBrokerMeta(broker: BrokerType): BrokerMeta {
  return BROKER_META[broker]
}
