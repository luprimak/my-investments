const BASE_URL = 'https://iss.moex.com/iss'

export function securitiesUrl(board: string, engine: string, market: string, ticker: string): string {
  return `${BASE_URL}/engines/${engine}/markets/${market}/boards/${board}/securities/${ticker}.json`
}

export function securitiesBulkUrl(board: string, engine: string, market: string, tickers: string[]): string {
  const tickerList = tickers.join(',')
  return `${BASE_URL}/engines/${engine}/markets/${market}/boards/${board}/securities.json?securities=${tickerList}`
}

export function historyUrl(board: string, engine: string, market: string, ticker: string, from: string, to: string): string {
  return `${BASE_URL}/history/engines/${engine}/markets/${market}/boards/${board}/securities/${ticker}.json?from=${from}&till=${to}`
}

export function securityInfoUrl(ticker: string): string {
  return `${BASE_URL}/securities/${ticker}.json`
}

export function securitySearchUrl(query: string): string {
  return `${BASE_URL}/securities.json?q=${encodeURIComponent(query)}&limit=20`
}

export function indexUrl(indexId: string): string {
  return `${BASE_URL}/statistics/engines/stock/markets/index/analytics/${indexId}.json`
}

export function exchangeRateUrl(): string {
  return `${BASE_URL}/engines/currency/markets/selt/boards/CETS/securities.json`
}

export function quoteColumnsParam(): string {
  return 'iss.only=marketdata,securities&marketdata.columns=SECID,LAST,OPEN,HIGH,LOW,BID,OFFER,SPREAD,VOLTODAY,VALTODAY,CHANGE,LASTTOPREVPRICE,UPDATETIME,TRADINGSTATUS&securities.columns=SECID,PREVPRICE,LOTSIZE'
}

export function bondColumnsParam(): string {
  return 'iss.only=securities,marketdata&securities.columns=SECID,FACEVALUE,COUPONVALUE,COUPONPERCENT,COUPONPERIOD,ACCRUEDINT,NEXTCOUPON,MATDATE,OFFERDATE&marketdata.columns=SECID,LAST,DURATION,YIELDTOOFFER,YIELDDATETYPE'
}
