import type { Recommendation } from '../domain/models'

interface CostBreakdownProps {
  recommendations: Recommendation[]
}

export function CostBreakdown({ recommendations }: CostBreakdownProps) {
  const accepted = recommendations.filter(r => r.status === 'accepted')
  const totalCommission = accepted.reduce((sum, r) => sum + r.impact.estimatedCommission, 0)
  const totalTax = accepted.reduce((sum, r) => sum + r.impact.estimatedTax, 0)
  const totalCost = accepted.reduce((sum, r) => sum + r.impact.totalCost, 0)

  if (accepted.length === 0) {
    return null
  }

  return (
    <div className="cost-breakdown">
      <h3>Итого по принятым рекомендациям</h3>
      <table className="cost-table">
        <tbody>
          <tr>
            <td>Принятых рекомендаций:</td>
            <td><strong>{accepted.length}</strong></td>
          </tr>
          <tr>
            <td>Комиссии брокеров:</td>
            <td>{totalCommission.toLocaleString('ru-RU')} ₽</td>
          </tr>
          <tr>
            <td>НДФЛ:</td>
            <td>{totalTax.toLocaleString('ru-RU')} ₽</td>
          </tr>
          <tr className="cost-total">
            <td>Общая стоимость:</td>
            <td><strong>{totalCost.toLocaleString('ru-RU')} ₽</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
