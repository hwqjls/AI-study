import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddTransaction } from '../AddTransaction'
import { useRecordsStore } from '../../../store/recordsStore'

describe('AddTransaction', () => {
  beforeEach(() => {
    useRecordsStore.setState({
      records: [],
      hydrated: true,
      loadError: null,
    })
    localStorage.clear()
  })

  it('renders form fields', () => {
    render(
      <MemoryRouter>
        <AddTransaction />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('金额（元）')).toBeInTheDocument()
    expect(screen.getByLabelText('分类')).toBeInTheDocument()
    expect(screen.getByLabelText('日期')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument()
  })

  it('submits valid record and calls onSuccess', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <MemoryRouter>
        <AddTransaction initialDate="2026-07-21" onSuccess={onSuccess} />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('金额（元）'), '12.50')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onSuccess).toHaveBeenCalledOnce()
    expect(onSuccess.mock.calls[0][0]).toMatchObject({ date: '2026-07-21' })
    expect(useRecordsStore.getState().records).toHaveLength(1)
    expect(useRecordsStore.getState().records[0]?.amountCents).toBe(1250)
  })

  it('shows validation error for invalid amount', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <MemoryRouter>
        <AddTransaction onSuccess={onSuccess} />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('金额（元）'), '0')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText('金额必须大于 0，最多两位小数')).toBeInTheDocument()
  })
})
