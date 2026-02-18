import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeightEntryForm } from '../WeightEntryForm'

describe('WeightEntryForm', () => {
  it('renders form fields', () => {
    render(<WeightEntryForm onAdd={vi.fn()} />)
    expect(screen.getByLabelText('Дата')).toBeInTheDocument()
    expect(screen.getByLabelText('Вес (кг)')).toBeInTheDocument()
    expect(screen.getByLabelText('Заметка')).toBeInTheDocument()
    expect(screen.getByText('Добавить')).toBeInTheDocument()
  })

  it('calls onAdd with entry data when form is submitted', () => {
    const onAdd = vi.fn()
    render(<WeightEntryForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText('Вес (кг)'), { target: { value: '92.5' } })
    fireEvent.click(screen.getByText('Добавить'))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd.mock.calls[0]![0]).toMatchObject({
      weight: 92.5,
    })
  })

  it('does not submit with invalid weight', () => {
    const onAdd = vi.fn()
    render(<WeightEntryForm onAdd={onAdd} />)

    fireEvent.change(screen.getByLabelText('Вес (кг)'), { target: { value: '' } })
    fireEvent.click(screen.getByText('Добавить'))

    expect(onAdd).not.toHaveBeenCalled()
  })

  it('clears weight input after successful submission', () => {
    render(<WeightEntryForm onAdd={vi.fn()} />)
    const input = screen.getByLabelText('Вес (кг)') as HTMLInputElement

    fireEvent.change(input, { target: { value: '90' } })
    fireEvent.click(screen.getByText('Добавить'))

    expect(input.value).toBe('')
  })
})
