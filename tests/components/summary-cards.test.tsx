import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCards } from '@/modules/dashboard/components/SummaryCards'
import type { BalanceSummaryDTO } from '@/core/dtos'
import '@/i18n'

// useCountUp uses requestAnimationFrame which doesn't run in jsdom.
// Return target directly so rendered values are immediately testable.
vi.mock('@/lib/hooks/useCountUp', () => ({
  useCountUp: (target: number) => target,
}))

const summary: BalanceSummaryDTO = {
  currentBalance: 12_500,
  initialBalance: 10_000,
  projectedBalance: 8_900,
  dailyAllowance: 750,
  totalDebt: 3_400,
  totalPendingScheduled: 1_200,
  totalConfirmedScheduled: 2_200,
  totalDailyExpenses: 4_300,
  expectedIncome: 5_000,
  remainingDays: 12,
  month: 5,
  year: 2026,
  quincena: 'primera',
}

describe('Dashboard <SummaryCards />', () => {
  it('renders the four stat tiles when data is loaded', () => {
    render(<SummaryCards summary={summary} isLoading={false} />)
    // Currency is rendered with es-MX MXN — match the digits, not the symbol.
    expect(screen.getByText(/12,500/)).toBeInTheDocument()
    expect(screen.getByText(/8,900/)).toBeInTheDocument()
    expect(screen.getByText(/3,400/)).toBeInTheDocument()
    expect(screen.getByText(/750/)).toBeInTheDocument()
  })

  it('renders four skeleton placeholders while loading', () => {
    const { container } = render(<SummaryCards summary={null} isLoading />)
    // Skeleton component uses animate-shimmer (not animate-pulse).
    const skeletons = container.querySelectorAll('.animate-shimmer')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })

  it('renders nothing when summary is null and not loading', () => {
    const { container } = render(<SummaryCards summary={null} isLoading={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})
