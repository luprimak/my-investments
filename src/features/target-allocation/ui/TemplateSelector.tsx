import { ALLOCATION_TEMPLATES } from '../domain/templates'
import type { AllocationTemplate, RiskLevel } from '../domain/models'

interface TemplateSelectorProps {
  onSelect: (template: AllocationTemplate) => void
}

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="template-selector">
      <h3>Шаблоны стратегий</h3>
      <div className="template-grid">
        {ALLOCATION_TEMPLATES.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h4>{template.name}</h4>
              <span
                className="risk-badge"
                style={{ backgroundColor: RISK_COLORS[template.riskLevel] }}
              >
                {RISK_LABELS[template.riskLevel]} риск
              </span>
            </div>
            <p className="template-description">{template.description}</p>
            <ul className="template-rules">
              {template.rules.map(rule => (
                <li key={rule.id}>
                  {rule.category}: <strong>{rule.targetPercent}%</strong>
                </li>
              ))}
            </ul>
            <button
              className="btn btn-primary"
              onClick={() => onSelect(template)}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
