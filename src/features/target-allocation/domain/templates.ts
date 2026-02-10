import type { AllocationTemplate } from './models'

export const ALLOCATION_TEMPLATES: AllocationTemplate[] = [
  {
    id: 'conservative',
    name: 'Консервативная',
    description: 'Низкий риск. Подходит для сохранения капитала с умеренным доходом.',
    riskLevel: 'low',
    rules: [
      { id: 'cons-1', dimension: 'asset_class', category: 'Облигации', targetPercent: 70 },
      { id: 'cons-2', dimension: 'asset_class', category: 'Акции голубых фишек', targetPercent: 20 },
      { id: 'cons-3', dimension: 'asset_class', category: 'Денежные средства', targetPercent: 10 },
    ],
  },
  {
    id: 'moderate',
    name: 'Умеренная',
    description: 'Средний риск. Баланс между ростом и защитой капитала.',
    riskLevel: 'medium',
    rules: [
      { id: 'mod-1', dimension: 'asset_class', category: 'Акции', targetPercent: 60 },
      { id: 'mod-2', dimension: 'asset_class', category: 'Облигации', targetPercent: 35 },
      { id: 'mod-3', dimension: 'asset_class', category: 'Денежные средства', targetPercent: 5 },
    ],
  },
  {
    id: 'aggressive',
    name: 'Агрессивная',
    description: 'Высокий риск. Максимальный потенциал роста.',
    riskLevel: 'high',
    rules: [
      { id: 'agg-1', dimension: 'asset_class', category: 'Акции', targetPercent: 85 },
      { id: 'agg-2', dimension: 'asset_class', category: 'Облигации', targetPercent: 10 },
      { id: 'agg-3', dimension: 'asset_class', category: 'Денежные средства', targetPercent: 5 },
    ],
  },
  {
    id: 'retirement',
    name: 'Пенсионная',
    description: 'Долгосрочная стратегия с акцентом на дивидендный доход.',
    riskLevel: 'medium',
    rules: [
      { id: 'ret-1', dimension: 'asset_class', category: 'Акции дивидендные', targetPercent: 40 },
      { id: 'ret-2', dimension: 'asset_class', category: 'Облигации', targetPercent: 50 },
      { id: 'ret-3', dimension: 'asset_class', category: 'Альтернативы', targetPercent: 10 },
    ],
  },
]

export function getTemplateById(id: string): AllocationTemplate | undefined {
  return ALLOCATION_TEMPLATES.find(t => t.id === id)
}
