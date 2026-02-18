import type { ViewPosition, BrokerAccount, BrokerName } from '../domain/models'

const MOCK_POSITIONS: ViewPosition[] = [
  // Сбербанк — акции
  {
    ticker: 'SBER', name: 'Сбербанк', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Финансы', currency: 'RUB',
    quantity: 100, currentPrice: 295.5, currentValue: 29550, costBasis: 24000,
    purchaseDate: '2024-03-15', dailyVolume: 45000000,
    unrealizedGain: 5550, unrealizedGainPercent: 23.13, portfolioWeight: 0,
  },
  {
    ticker: 'SBERP', name: 'Сбербанк (прив.)', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'preferred', sector: 'Финансы', currency: 'RUB',
    quantity: 50, currentPrice: 280.0, currentValue: 14000, costBasis: 12500,
    purchaseDate: '2024-05-10', dailyVolume: 8000000,
    unrealizedGain: 1500, unrealizedGainPercent: 12.0, portfolioWeight: 0,
  },
  {
    ticker: 'LKOH', name: 'Лукойл', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Нефть и газ', currency: 'RUB',
    quantity: 5, currentPrice: 7200, currentValue: 36000, costBasis: 32000,
    purchaseDate: '2024-01-20', dailyVolume: 3500000,
    unrealizedGain: 4000, unrealizedGainPercent: 12.5, portfolioWeight: 0,
  },
  // Альфа — облигации
  {
    ticker: 'SU26238', name: 'ОФЗ 26238', broker: 'alfa', accountType: 'iis',
    assetClass: 'bond', assetSubclass: 'ofz', sector: 'Гос. облигации', currency: 'RUB',
    quantity: 50, currentPrice: 620, currentValue: 31000, costBasis: 30000,
    purchaseDate: '2024-06-01', dailyVolume: 500000,
    unrealizedGain: 1000, unrealizedGainPercent: 3.33, portfolioWeight: 0,
  },
  {
    ticker: 'RU000A106Y', name: 'Газпром Капитал', broker: 'alfa', accountType: 'iis',
    assetClass: 'bond', assetSubclass: 'corporate', sector: 'Нефть и газ', currency: 'RUB',
    quantity: 30, currentPrice: 980, currentValue: 29400, costBasis: 28500,
    purchaseDate: '2024-04-15', dailyVolume: 200000,
    unrealizedGain: 900, unrealizedGainPercent: 3.16, portfolioWeight: 0,
  },
  // Т-Банк — ETF и акции
  {
    ticker: 'TMOS', name: 'Тинькофф iMOEX', broker: 'tbank', accountType: 'standard',
    assetClass: 'etf', sector: 'Широкий рынок', currency: 'RUB',
    quantity: 500, currentPrice: 6.8, currentValue: 3400, costBasis: 3000,
    purchaseDate: '2024-07-10', dailyVolume: 15000000,
    unrealizedGain: 400, unrealizedGainPercent: 13.33, portfolioWeight: 0,
  },
  {
    ticker: 'GAZP', name: 'Газпром', broker: 'tbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Нефть и газ', currency: 'RUB',
    quantity: 200, currentPrice: 155, currentValue: 31000, costBasis: 35000,
    purchaseDate: '2024-02-20', dailyVolume: 30000000,
    unrealizedGain: -4000, unrealizedGainPercent: -11.43, portfolioWeight: 0,
  },
  {
    ticker: 'YNDX', name: 'Яндекс', broker: 'tbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Технологии', currency: 'RUB',
    quantity: 10, currentPrice: 3950, currentValue: 39500, costBasis: 30000,
    purchaseDate: '2024-08-01', dailyVolume: 2500000,
    unrealizedGain: 9500, unrealizedGainPercent: 31.67, portfolioWeight: 0,
  },
  {
    ticker: 'MGNT', name: 'Магнит', broker: 'tbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Потребительский', currency: 'RUB',
    quantity: 3, currentPrice: 5200, currentValue: 15600, costBasis: 14400,
    purchaseDate: '2024-09-05', dailyVolume: 500000,
    unrealizedGain: 1200, unrealizedGainPercent: 8.33, portfolioWeight: 0,
  },
  // ВТБ — спец. счета
  {
    ticker: 'TBRU', name: 'Тинькофф Облигации', broker: 'vtb', accountType: 'auto_managed',
    assetClass: 'etf', sector: 'Облигации', currency: 'RUB',
    quantity: 1000, currentPrice: 5.5, currentValue: 5500, costBasis: 5000,
    purchaseDate: '2024-10-01', dailyVolume: 5000000,
    unrealizedGain: 500, unrealizedGainPercent: 10.0, portfolioWeight: 0,
  },
  {
    ticker: 'VTBM', name: 'ВТБ Ликвидность', broker: 'vtb', accountType: 'trust_management',
    assetClass: 'etf', sector: 'Денежный рынок', currency: 'RUB',
    quantity: 2000, currentPrice: 1.08, currentValue: 2160, costBasis: 2000,
    purchaseDate: '2024-11-10', dailyVolume: 30000000,
    unrealizedGain: 160, unrealizedGainPercent: 8.0, portfolioWeight: 0,
  },
  {
    ticker: 'GMKN', name: 'Норильский Никель', broker: 'vtb', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Металлургия', currency: 'RUB',
    quantity: 2, currentPrice: 13800, currentValue: 27600, costBasis: 25000,
    purchaseDate: '2024-04-20', dailyVolume: 1200000,
    unrealizedGain: 2600, unrealizedGainPercent: 10.4, portfolioWeight: 0,
  },
  {
    ticker: 'ROSN', name: 'Роснефть', broker: 'sberbank', accountType: 'standard',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Нефть и газ', currency: 'RUB',
    quantity: 50, currentPrice: 580, currentValue: 29000, costBasis: 26000,
    purchaseDate: '2024-03-01', dailyVolume: 5000000,
    unrealizedGain: 3000, unrealizedGainPercent: 11.54, portfolioWeight: 0,
  },
  {
    ticker: 'MOEX', name: 'Московская биржа', broker: 'alfa', accountType: 'iis',
    assetClass: 'stock', assetSubclass: 'common', sector: 'Финансы', currency: 'RUB',
    quantity: 100, currentPrice: 230, currentValue: 23000, costBasis: 20000,
    purchaseDate: '2024-07-15', dailyVolume: 3000000,
    unrealizedGain: 3000, unrealizedGainPercent: 15.0, portfolioWeight: 0,
  },
  {
    ticker: 'SU26240', name: 'ОФЗ 26240', broker: 'vtb', accountType: 'standard',
    assetClass: 'bond', assetSubclass: 'ofz', sector: 'Гос. облигации', currency: 'RUB',
    quantity: 20, currentPrice: 710, currentValue: 14200, costBasis: 13800,
    purchaseDate: '2024-08-20', dailyVolume: 300000,
    unrealizedGain: 400, unrealizedGainPercent: 2.9, portfolioWeight: 0,
  },
]

function computeWeights(positions: ViewPosition[]): ViewPosition[] {
  const total = positions.reduce((sum, p) => sum + p.currentValue, 0)
  if (total === 0) return positions
  return positions.map(p => ({
    ...p,
    portfolioWeight: (p.currentValue / total) * 100,
  }))
}

export function getAllPositions(): ViewPosition[] {
  return computeWeights(MOCK_POSITIONS)
}

export function getPositionsByBroker(broker: BrokerName): ViewPosition[] {
  const filtered = MOCK_POSITIONS.filter(p => p.broker === broker)
  return computeWeights(filtered)
}

export function getBrokerAccounts(): BrokerAccount[] {
  const brokers: BrokerName[] = ['sberbank', 'alfa', 'tbank', 'vtb']
  const displayNames: Record<BrokerName, string> = {
    sberbank: 'Сбербанк Инвестиции',
    alfa: 'Альфа-Инвестиции',
    tbank: 'Т-Инвестиции',
    vtb: 'ВТБ Мои Инвестиции',
  }

  const accounts: BrokerAccount[] = []
  for (const broker of brokers) {
    const positions = MOCK_POSITIONS.filter(p => p.broker === broker)
    if (positions.length === 0) continue

    const accountTypes = [...new Set(positions.map(p => p.accountType))]
    for (const accountType of accountTypes) {
      const acctPositions = positions.filter(p => p.accountType === accountType)
      const totalValue = acctPositions.reduce((sum, p) => sum + p.currentValue, 0)
      const totalGain = acctPositions.reduce((sum, p) => sum + p.unrealizedGain, 0)

      accounts.push({
        broker,
        displayName: displayNames[broker],
        accountType,
        positions: acctPositions,
        totalValue,
        totalGain,
        positionCount: acctPositions.length,
      })
    }
  }

  return accounts
}
