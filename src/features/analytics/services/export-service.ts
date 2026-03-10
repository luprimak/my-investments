import type { GeneratedReport } from '../domain/models'
import { getReportTitle } from './report-service'

export function exportToCsv(report: GeneratedReport): string {
  const lines: string[] = []
  const title = getReportTitle(report.config)

  lines.push(`Отчёт по портфелю;${title}`)
  lines.push(`Дата генерации;${new Date(report.generatedAt).toLocaleDateString('ru-RU')}`)
  lines.push('')
  lines.push('Показатель;Значение')
  lines.push(`Доходность портфеля;${report.portfolioReturn.toFixed(2)}%`)
  if (report.benchmarkReturn !== undefined) {
    lines.push(`Доходность бенчмарка;${report.benchmarkReturn.toFixed(2)}%`)
  }
  lines.push(`Волатильность;${report.metrics.volatility.toFixed(2)}%`)
  lines.push(`Коэффициент Шарпа;${report.metrics.sharpeRatio.toFixed(2)}`)
  lines.push(`Макс. просадка;${report.metrics.maxDrawdown.toFixed(2)}%`)

  lines.push('')
  lines.push('Распределение активов')
  lines.push('Категория;Стоимость (₽);Доля (%)')
  for (const a of report.allocation) {
    lines.push(`${a.category};${a.value.toFixed(2)};${a.percent.toFixed(2)}`)
  }

  if (report.taxSummary) {
    lines.push('')
    lines.push('Налоговая сводка')
    lines.push(`Дивидендный доход;${report.taxSummary.dividendIncome.toFixed(2)}`)
    lines.push(`Налог на дивиденды;${report.taxSummary.dividendTax.toFixed(2)}`)
    lines.push(`Прирост капитала;${report.taxSummary.capitalGains.toFixed(2)}`)
    lines.push(`Налог на прирост;${report.taxSummary.capitalGainsTax.toFixed(2)}`)
    lines.push(`Льготные доходы;${report.taxSummary.taxExemptGains.toFixed(2)}`)
    lines.push(`Итого налогов;${report.taxSummary.totalTaxLiability.toFixed(2)}`)
  }

  if (report.transactions && report.transactions.length > 0) {
    lines.push('')
    lines.push('Операции')
    lines.push('Дата;Тикер;Тип;Сумма;Налог;Льгота')
    for (const t of report.transactions) {
      const typeLabel = t.type === 'dividend' ? 'Дивиденды' : 'Продажа'
      const exemptLabel = t.isExempt ? 'Да' : 'Нет'
      lines.push(`${t.date};${t.ticker};${typeLabel};${t.amount.toFixed(2)};${t.taxAmount.toFixed(2)};${exemptLabel}`)
    }
  }

  return lines.join('\n')
}

export function exportToHtml(report: GeneratedReport): string {
  const title = getReportTitle(report.config)

  let html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Отчёт: ${title}</title>
<style>
body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333}
h1{color:#1976d2;border-bottom:2px solid #1976d2;padding-bottom:8px}
h2{color:#555;margin-top:24px}
table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e0e0e0}
th{background:#f5f5f5;font-weight:600}
.positive{color:#2e7d32}.negative{color:#f44336}
.metric-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0}
.metric-card{padding:12px;border:1px solid #e0e0e0;border-radius:8px}
.metric-value{font-size:1.3em;font-weight:700}
.metric-label{font-size:0.85em;color:#999}
@media print{body{padding:0}h1{page-break-before:avoid}}
</style></head><body>
<h1>Отчёт по портфелю — ${title}</h1>
<p>Дата: ${new Date(report.generatedAt).toLocaleDateString('ru-RU')}</p>`

  html += `<h2>Ключевые показатели</h2>
<div class="metric-grid">
<div class="metric-card"><div class="metric-label">Доходность</div><div class="metric-value ${report.portfolioReturn >= 0 ? 'positive' : 'negative'}">${report.portfolioReturn.toFixed(2)}%</div></div>
<div class="metric-card"><div class="metric-label">Волатильность</div><div class="metric-value">${report.metrics.volatility.toFixed(2)}%</div></div>
<div class="metric-card"><div class="metric-label">Коэфф. Шарпа</div><div class="metric-value">${report.metrics.sharpeRatio.toFixed(2)}</div></div>
<div class="metric-card"><div class="metric-label">Макс. просадка</div><div class="metric-value negative">${report.metrics.maxDrawdown.toFixed(2)}%</div></div>
</div>`

  html += `<h2>Распределение активов</h2>
<table><thead><tr><th>Категория</th><th>Стоимость (₽)</th><th>Доля</th></tr></thead><tbody>`
  for (const a of report.allocation) {
    html += `<tr><td>${a.category}</td><td>${a.value.toLocaleString('ru-RU')}</td><td>${a.percent.toFixed(1)}%</td></tr>`
  }
  html += '</tbody></table>'

  if (report.taxSummary) {
    html += `<h2>Налоги</h2>
<table><thead><tr><th>Показатель</th><th>Сумма (₽)</th></tr></thead><tbody>
<tr><td>Дивидендный доход</td><td>${report.taxSummary.dividendIncome.toLocaleString('ru-RU')}</td></tr>
<tr><td>Налог на дивиденды</td><td>${report.taxSummary.dividendTax.toLocaleString('ru-RU')}</td></tr>
<tr><td>Прирост капитала</td><td>${report.taxSummary.capitalGains.toLocaleString('ru-RU')}</td></tr>
<tr><td>Налог на прирост</td><td>${report.taxSummary.capitalGainsTax.toLocaleString('ru-RU')}</td></tr>
<tr><td><strong>Итого налогов</strong></td><td><strong>${report.taxSummary.totalTaxLiability.toLocaleString('ru-RU')}</strong></td></tr>
</tbody></table>`
  }

  html += '</body></html>'
  return html
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
