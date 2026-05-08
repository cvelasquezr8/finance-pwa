import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from '@/i18n'
import { AddTransactionModal } from '@/modules/transactions/components/AddTransactionModal'
import type { MonthFilter, QuincenaFilter } from '@/core/types'

const filter: MonthFilter & { quincena: QuincenaFilter } = {
  month: 5,
  year: 2026,
  quincena: 'primera',
}

describe('Transactions — <AddTransactionModal />', () => {
  it('renders the trigger button with i18n label', () => {
    render(<AddTransactionModal filter={filter} onAdd={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: i18n.t('addTransaction.triggerLabel') })
    ).toBeInTheDocument()
  })

  it('opens the modal and shows expense fields by default', async () => {
    const user = userEvent.setup()
    render(<AddTransactionModal filter={filter} onAdd={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: i18n.t('addTransaction.triggerLabel') }))
    await waitFor(() => {
      expect(screen.getByText(i18n.t('addTransaction.title'))).toBeInTheDocument()
    })
    expect(screen.getByLabelText(i18n.t('addTransaction.description'))).toBeInTheDocument()
    expect(screen.getByLabelText(i18n.t('addTransaction.amount'))).toBeInTheDocument()
  })

  it('submits an expense and forwards the form values to onAdd', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AddTransactionModal filter={filter} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: i18n.t('addTransaction.triggerLabel') }))
    await user.type(screen.getByLabelText(i18n.t('addTransaction.description')), 'Comida')
    await user.type(screen.getByLabelText(i18n.t('addTransaction.amount')), '250')
    await user.click(screen.getByRole('button', { name: i18n.t('addTransaction.addExpense') }))

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1))
    const [mode, description, amount] = onAdd.mock.calls[0]
    expect(mode).toBe('egreso')
    expect(description).toBe('Comida')
    expect(amount).toBe(250)
  })
})
