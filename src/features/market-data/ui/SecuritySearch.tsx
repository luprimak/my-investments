import { useState } from 'react'
import type { Security } from '../domain/models'
import { DEMO_SECURITIES } from '../services/demo-data'

interface SecuritySearchProps {
  onSelect: (security: Security) => void
}

const TYPE_LABELS: Record<string, string> = {
  stock: 'Акция',
  preferred_stock: 'Акция прив.',
  bond_ofz: 'ОФЗ',
  bond_corp: 'Облигация',
  bond_muni: 'Муницип.',
  etf: 'ETF',
  index: 'Индекс',
}

export function SecuritySearch({ onSelect }: SecuritySearchProps) {
  const [query, setQuery] = useState('')

  const results = query.length >= 1
    ? DEMO_SECURITIES.filter(s =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.shortName.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="search-section">
      <input
        className="search-input"
        type="text"
        placeholder="Поиск по тикеру или названию..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map(sec => (
            <div
              key={sec.ticker}
              className="search-result-item"
              onClick={() => { onSelect(sec); setQuery('') }}
            >
              <div>
                <span className="search-result-ticker">{sec.ticker}</span>
                {' '}
                <span className="search-result-name">{sec.shortName}</span>
              </div>
              <span className="search-result-type">
                {TYPE_LABELS[sec.type] ?? sec.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
