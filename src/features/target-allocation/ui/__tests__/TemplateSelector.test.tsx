import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateSelector } from '../TemplateSelector'
import { ALLOCATION_TEMPLATES } from '../../domain/templates'

describe('TemplateSelector', () => {
  it('renders all templates', () => {
    render(<TemplateSelector onSelect={() => {}} />)

    for (const template of ALLOCATION_TEMPLATES) {
      expect(screen.getByText(template.name)).toBeInTheDocument()
    }
  })

  it('shows risk badges for each template', () => {
    render(<TemplateSelector onSelect={() => {}} />)

    expect(screen.getByText('Низкий риск')).toBeInTheDocument()
    expect(screen.getAllByText('Средний риск')).toHaveLength(2) // moderate + retirement
    expect(screen.getByText('Высокий риск')).toBeInTheDocument()
  })

  it('calls onSelect with correct template when clicking a button', () => {
    const onSelect = vi.fn()
    render(<TemplateSelector onSelect={onSelect} />)

    const buttons = screen.getAllByText('Выбрать')
    fireEvent.click(buttons[0]!)

    expect(onSelect).toHaveBeenCalledWith(ALLOCATION_TEMPLATES[0])
  })
})
