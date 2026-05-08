import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { EventCard } from '@/modules/events/components/EventCard'
import type { BudgetEventDTO, TransactionResponseDTO } from '@/core/dtos'
import '@/i18n'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const event: BudgetEventDTO = {
  id: 'evt-1',
  title: 'Cena de aniversario',
  description: 'Reservación en el restaurante de Sara',
  goalAmount: 5_000,
  deadline: '2026-06-15T00:00:00.000Z',
  createdBy: 'user-1',
  status: 'ACTIVE',
  participants: [
    {
      userId: 'user-1',
      alias: 'carlos',
      assignedPct: 50,
      status: 'CONFIRMED',
      joinedAt: '2026-05-01T00:00:00.000Z',
    },
    {
      userId: 'user-2',
      alias: 'sara',
      assignedPct: 50,
      status: 'PENDING_CONFIRMATION',
      joinedAt: '2026-05-01T00:00:00.000Z',
    },
  ],
  shoppingItems: [],
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
}

const linkedTx: TransactionResponseDTO[] = []

describe('Events — <EventCard /> participation flow', () => {
  it('shows title, description and confirmed participant count', () => {
    render(
      <MemoryRouter>
        <EventCard event={event} linkedTransactions={linkedTx} />
      </MemoryRouter>
    )
    expect(screen.getByText('Cena de aniversario')).toBeInTheDocument()
    expect(screen.getByText(/Reservación/)).toBeInTheDocument()
    // Only 1 of 2 participants is CONFIRMED.
    expect(screen.getByText(/^1 /)).toBeInTheDocument()
  })

  it('navigates to the event detail page on click', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <EventCard event={event} linkedTransactions={linkedTx} />
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button'))
    expect(navigateMock).toHaveBeenCalledWith('/events/evt-1')
  })
})
