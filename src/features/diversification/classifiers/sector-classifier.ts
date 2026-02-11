/**
 * Static mapping of major MOEX tickers to sectors.
 * Covers top ~60 most-traded securities on the Moscow Exchange.
 */
const SECTOR_MAP: Record<string, string> = {
  // Финансовый сектор
  SBER: 'Финансовый', SBERP: 'Финансовый',
  VTBR: 'Финансовый',
  TCSG: 'Финансовый', // Т-Банк (TCS Group)
  MOEX: 'Финансовый',
  CBOM: 'Финансовый', // МКБ
  BSPB: 'Финансовый', // Банк Санкт-Петербург
  AFLT: 'Финансовый', // (reclassified later if needed)

  // Нефть и газ
  GAZP: 'Нефть и газ',
  LKOH: 'Нефть и газ',
  ROSN: 'Нефть и газ',
  NVTK: 'Нефть и газ',
  SNGS: 'Нефть и газ', SNGSP: 'Нефть и газ',
  TATN: 'Нефть и газ', TATNP: 'Нефть и газ',
  SIBN: 'Нефть и газ', // Газпромнефть
  BANEP: 'Нефть и газ', // Башнефть

  // Металлургия и добыча
  GMKN: 'Металлургия',
  NLMK: 'Металлургия',
  CHMF: 'Металлургия', // Северсталь
  MAGN: 'Металлургия', // ММК
  PLZL: 'Металлургия', // Полюс
  ALRS: 'Металлургия', // АЛРОСА
  POLY: 'Металлургия', // Полиметалл
  RUAL: 'Металлургия',
  MTLR: 'Металлургия', // Мечел

  // IT и телеком
  YNDX: 'IT',
  VKCO: 'IT', // VK
  OZON: 'IT',
  HHRU: 'IT', // HeadHunter
  POSI: 'IT', // Positive Technologies
  MTSS: 'Телеком', // МТС
  RTKM: 'Телеком', // Ростелеком
  RTKMP: 'Телеком',

  // Энергетика
  IRAO: 'Энергетика', // Интер РАО
  HYDR: 'Энергетика', // РусГидро
  FEES: 'Энергетика', // ФСК ЕЭС
  LSNG: 'Энергетика', // Ленэнерго
  LSNGP: 'Энергетика',

  // Потребительский сектор
  MGNT: 'Потребительский', // Магнит
  FIVE: 'Потребительский', // X5 Group
  FLOT: 'Потребительский', // Совкомфлот
  PIKK: 'Строительство', // ПИК
  SMLT: 'Строительство', // Самолёт
  LSRG: 'Строительство', // ЛСР

  // Транспорт
  AFLT_: 'Транспорт', // Аэрофлот (re-assign)
  NMTP: 'Транспорт', // НМТП
  GLTR: 'Транспорт', // Глобалтранс

  // Удобрения / химия
  PHOR: 'Химия', // ФосАгро
  AKRN: 'Химия', // Акрон
}

// Fix AFLT — it's actually transport, not financial
SECTOR_MAP['AFLT'] = 'Транспорт'

/**
 * Returns the sector for a given ticker.
 * Falls back to "Прочее" for unknown tickers.
 */
export function getSector(ticker: string): string {
  return SECTOR_MAP[ticker.toUpperCase()] ?? 'Прочее'
}

/**
 * Returns all known sectors.
 */
export function getAllSectors(): string[] {
  return [...new Set(Object.values(SECTOR_MAP))]
}
