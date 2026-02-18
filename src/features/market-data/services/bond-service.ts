import type { BondData, CouponPayment } from '../domain/models'
import { BOARDS } from '../domain/boards'
import { moexGet } from '../api/moex-client'
import { securitiesUrl, bondColumnsParam } from '../api/moex-endpoints'
import { extractBlock, parseFirstRow } from '../api/moex-response-parser'
import { cacheGet, cacheSet } from '../cache/market-data-cache'

interface RawBondSecurity {
  ticker: string
  faceValue: number | null
  couponValue: number | null
  couponRate: number | null
  couponPeriod: number | null
  nkd: number | null
  nextCouponDate: string | null
  maturityDate: string | null
  offerDate: string | null
}

interface RawBondMarketData {
  ticker: string
  lastPrice: number | null
  duration: number | null
  yieldToMaturity: number | null
}

const BOND_SEC_MAPPING = {
  ticker: 'SECID',
  faceValue: 'FACEVALUE',
  couponValue: 'COUPONVALUE',
  couponRate: 'COUPONPERCENT',
  couponPeriod: 'COUPONPERIOD',
  nkd: 'ACCRUEDINT',
  nextCouponDate: 'NEXTCOUPON',
  maturityDate: 'MATDATE',
  offerDate: 'OFFERDATE',
}

const BOND_MD_MAPPING = {
  ticker: 'SECID',
  lastPrice: 'LAST',
  duration: 'DURATION',
  yieldToMaturity: 'YIELDTOOFFER',
}

function couponPeriodToFrequency(period: number | null): number {
  if (!period || period <= 0) return 0
  return Math.round(365 / period)
}

export async function getBondData(ticker: string, board = 'TQCB'): Promise<BondData> {
  const cached = cacheGet<BondData>('bond', ticker)
  if (cached) return cached

  const config = BOARDS[board]
  if (!config) throw new Error(`Unknown board: ${board}`)

  const url = `${securitiesUrl(board, config.engine, config.market, ticker)}&${bondColumnsParam()}`
  const response = await moexGet<Record<string, unknown>>(url)

  const secBlock = extractBlock(response, 'securities')
  const mdBlock = extractBlock(response, 'marketdata')

  if (!secBlock) throw new Error(`No bond data for ${ticker}`)

  const sec = parseFirstRow<RawBondSecurity>(secBlock, BOND_SEC_MAPPING)
  const md = mdBlock ? parseFirstRow<RawBondMarketData>(mdBlock, BOND_MD_MAPPING) : null

  if (!sec) throw new Error(`Empty bond data for ${ticker}`)

  const bond: BondData = {
    ticker,
    faceValue: sec.faceValue ?? 1000,
    couponRate: sec.couponRate ?? 0,
    couponValue: sec.couponValue ?? 0,
    couponFrequency: couponPeriodToFrequency(sec.couponPeriod),
    nkd: sec.nkd ?? 0,
    nextCouponDate: sec.nextCouponDate ?? '',
    maturityDate: sec.maturityDate ?? '',
    duration: md?.duration ?? 0,
    yieldToMaturity: md?.yieldToMaturity ?? 0,
    offerDate: sec.offerDate ?? undefined,
  }

  cacheSet('bond', ticker, bond)
  return bond
}

export async function getCouponSchedule(ticker: string): Promise<CouponPayment[]> {
  const cached = cacheGet<CouponPayment[]>('coupon', ticker)
  if (cached) return cached

  const bond = await getBondData(ticker)
  const payments: CouponPayment[] = []

  if (bond.nextCouponDate && bond.couponValue > 0) {
    const nextDate = new Date(bond.nextCouponDate)
    const periodDays = bond.couponFrequency > 0 ? Math.round(365 / bond.couponFrequency) : 182

    for (let i = 0; i < 8; i++) {
      const couponDate = new Date(nextDate)
      couponDate.setDate(couponDate.getDate() + i * periodDays)

      if (bond.maturityDate && couponDate.toISOString().slice(0, 10) > bond.maturityDate) break

      const recordDate = new Date(couponDate)
      recordDate.setDate(recordDate.getDate() - 5)

      payments.push({
        ticker,
        couponDate: couponDate.toISOString().slice(0, 10),
        couponValue: bond.couponValue,
        recordDate: recordDate.toISOString().slice(0, 10),
      })
    }
  }

  cacheSet('coupon', ticker, payments)
  return payments
}
