import type { TaxReport } from '../domain/models'

interface TaxSummaryProps {
  report: TaxReport
}

export function TaxSummary({ report }: TaxSummaryProps) {
  const formatAmount = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
  const formatDate = (d: string) => {
    const parts = d.split('-')
    return `${parts[2]}.${parts[1]}.${parts[0]}`
  }

  const periodLabel = report.period.quarter
    ? `${['I', 'II', 'III', 'IV'][report.period.quarter - 1]} квартал ${report.period.year}`
    : `${report.period.year} год`

  return (
    <div className="tax-summary-section">
      <h4 className="tax-summary-title">Налоговая сводка — {periodLabel}</h4>

      <div className="tax-cards">
        <div className="tax-card">
          <div className="tax-card-label">Дивиденды</div>
          <div className="tax-card-value">{formatAmount(report.dividendIncome)} ₽</div>
          <div className="tax-card-tax">Налог: {formatAmount(report.dividendTax)} ₽</div>
        </div>
        <div className="tax-card">
          <div className="tax-card-label">Прирост капитала</div>
          <div className="tax-card-value">{formatAmount(report.capitalGains)} ₽</div>
          <div className="tax-card-tax">Налог: {formatAmount(report.capitalGainsTax)} ₽</div>
        </div>
        <div className="tax-card">
          <div className="tax-card-label">Льготные доходы</div>
          <div className="tax-card-value positive">{formatAmount(report.taxExemptGains)} ₽</div>
          <div className="tax-card-tax">Освобождено от налога</div>
        </div>
        <div className="tax-card tax-card-total">
          <div className="tax-card-label">Итого к уплате</div>
          <div className="tax-card-value">{formatAmount(report.totalTaxLiability)} ₽</div>
        </div>
      </div>

      {report.transactions.length > 0 && (
        <div className="tax-transactions">
          <h5>Налогооблагаемые операции</h5>
          <table className="tax-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тикер</th>
                <th>Тип</th>
                <th>Сумма</th>
                <th>Налог</th>
                <th>Льгота</th>
              </tr>
            </thead>
            <tbody>
              {report.transactions.map((tx, i) => (
                <tr key={i}>
                  <td>{formatDate(tx.date)}</td>
                  <td className="tx-ticker">{tx.ticker}</td>
                  <td>{tx.type === 'dividend' ? 'Дивиденды' : 'Продажа'}</td>
                  <td>{formatAmount(tx.amount)} ₽</td>
                  <td>{formatAmount(tx.taxAmount)} ₽</td>
                  <td>{tx.isExempt ? <span className="tax-exempt-badge">{tx.exemptReason}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
