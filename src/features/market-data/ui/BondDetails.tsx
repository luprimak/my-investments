import type { BondData } from '../domain/models'

interface BondDetailsProps {
  bond: BondData
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function BondDetails({ bond }: BondDetailsProps) {
  return (
    <div className="bond-details">
      <div className="bond-grid">
        <div className="bond-field">
          <span className="bond-field-label">Номинал</span>
          <span className="bond-field-value">{bond.faceValue.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Ставка купона</span>
          <span className="bond-field-value">{bond.couponRate.toFixed(2)}%</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Купон</span>
          <span className="bond-field-value">{bond.couponValue.toFixed(2)} ₽</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Частота выплат</span>
          <span className="bond-field-value">{bond.couponFrequency} раз/год</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">НКД</span>
          <span className="bond-field-value">{bond.nkd.toFixed(2)} ₽</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Следующий купон</span>
          <span className="bond-field-value">{formatDate(bond.nextCouponDate)}</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Дата погашения</span>
          <span className="bond-field-value">{formatDate(bond.maturityDate)}</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Дюрация</span>
          <span className="bond-field-value">{bond.duration.toFixed(1)} лет</span>
        </div>
        <div className="bond-field">
          <span className="bond-field-label">Доходность к погашению (YTM)</span>
          <span className="bond-field-value">{bond.yieldToMaturity.toFixed(2)}%</span>
        </div>
        {bond.offerDate && (
          <div className="bond-field">
            <span className="bond-field-label">Дата оферты</span>
            <span className="bond-field-value">{formatDate(bond.offerDate)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
