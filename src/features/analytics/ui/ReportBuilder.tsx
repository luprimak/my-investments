import { useState } from 'react'
import type { ReportConfig, ReportPeriodType, GeneratedReport } from '../domain/models'
import { getReportTitle } from '../services/report-service'
import { exportToCsv, exportToHtml, downloadFile } from '../services/export-service'

interface ReportBuilderProps {
  onGenerate: (config: ReportConfig) => GeneratedReport | null
}

export function ReportBuilder({ onGenerate }: ReportBuilderProps) {
  const currentYear = new Date().getFullYear()
  const [periodType, setPeriodType] = useState<ReportPeriodType>('yearly')
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(1)
  const [quarter, setQuarter] = useState(1)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTax, setIncludeTax] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [report, setReport] = useState<GeneratedReport | null>(null)

  const config: ReportConfig = {
    periodType,
    year,
    month: periodType === 'monthly' ? month : undefined,
    quarter: periodType === 'quarterly' ? quarter : undefined,
    includeCharts,
    includeTaxBreakdown: includeTax,
    includeTransactions,
  }

  function handleGenerate() {
    const result = onGenerate(config)
    setReport(result)
  }

  function handleExportCsv() {
    if (!report) return
    const csv = exportToCsv(report)
    downloadFile(csv, `report-${year}.csv`, 'text/csv;charset=utf-8')
  }

  function handleExportHtml() {
    if (!report) return
    const html = exportToHtml(report)
    const win = window.open()
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]

  return (
    <div className="report-builder-section">
      <h4 className="report-builder-title">Генератор отчётов</h4>

      <div className="report-config">
        <div className="config-row">
          <label className="config-label">Период</label>
          <div className="config-buttons">
            <button className={`config-btn ${periodType === 'monthly' ? 'active' : ''}`} onClick={() => setPeriodType('monthly')}>Месяц</button>
            <button className={`config-btn ${periodType === 'quarterly' ? 'active' : ''}`} onClick={() => setPeriodType('quarterly')}>Квартал</button>
            <button className={`config-btn ${periodType === 'yearly' ? 'active' : ''}`} onClick={() => setPeriodType('yearly')}>Год</button>
          </div>
        </div>

        <div className="config-row">
          <label className="config-label">Год</label>
          <select className="config-select" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {periodType === 'monthly' && (
          <div className="config-row">
            <label className="config-label">Месяц</label>
            <select className="config-select" value={month} onChange={e => setMonth(Number(e.target.value))}>
              {monthNames.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {periodType === 'quarterly' && (
          <div className="config-row">
            <label className="config-label">Квартал</label>
            <select className="config-select" value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
              <option value={1}>I квартал</option>
              <option value={2}>II квартал</option>
              <option value={3}>III квартал</option>
              <option value={4}>IV квартал</option>
            </select>
          </div>
        )}

        <div className="config-row config-checkboxes">
          <label className="config-checkbox">
            <input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} />
            Включить графики
          </label>
          <label className="config-checkbox">
            <input type="checkbox" checked={includeTax} onChange={e => setIncludeTax(e.target.checked)} />
            Налоговая сводка
          </label>
          <label className="config-checkbox">
            <input type="checkbox" checked={includeTransactions} onChange={e => setIncludeTransactions(e.target.checked)} />
            История операций
          </label>
        </div>

        <button className="report-generate-btn" onClick={handleGenerate}>
          Сгенерировать отчёт
        </button>
      </div>

      {report && (
        <div className="report-preview">
          <div className="report-preview-header">
            <h5>Отчёт: {getReportTitle(report.config)}</h5>
            <div className="report-export-buttons">
              <button className="export-btn" onClick={handleExportCsv}>Скачать CSV</button>
              <button className="export-btn" onClick={handleExportHtml}>Печать / PDF</button>
            </div>
          </div>
          <div className="report-preview-summary">
            <div className="report-metric">
              <span className="report-metric-label">Доходность</span>
              <span className={`report-metric-value ${report.portfolioReturn >= 0 ? 'positive' : 'negative'}`}>
                {report.portfolioReturn >= 0 ? '+' : ''}{report.portfolioReturn.toFixed(2)}%
              </span>
            </div>
            <div className="report-metric">
              <span className="report-metric-label">Волатильность</span>
              <span className="report-metric-value">{report.metrics.volatility.toFixed(2)}%</span>
            </div>
            <div className="report-metric">
              <span className="report-metric-label">Коэфф. Шарпа</span>
              <span className="report-metric-value">{report.metrics.sharpeRatio.toFixed(2)}</span>
            </div>
            {report.taxSummary && (
              <div className="report-metric">
                <span className="report-metric-label">Налоги</span>
                <span className="report-metric-value">{report.taxSummary.totalTaxLiability.toLocaleString('ru-RU')} ₽</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
