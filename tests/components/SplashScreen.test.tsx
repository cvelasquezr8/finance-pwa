import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { SplashScreen } from '@/components/SplashScreen'
import { SplashContext } from '@/contexts/SplashContext'
import type { SplashState } from '@/contexts/SplashContext'

function renderWithPhase(state: SplashState) {
  return render(
    <SplashContext.Provider
      value={{ splashState: state, showSplash: vi.fn().mockResolvedValue(undefined) }}
    >
      <SplashScreen />
    </SplashContext.Provider>
  )
}

describe('<SplashScreen />', () => {
  it('renders nothing when phase is idle', () => {
    const { container } = renderWithPhase({ phase: 'idle', reason: null })
    expect(container.firstChild).toBeNull()
  })

  it('renders branded overlay when phase is showing', () => {
    renderWithPhase({ phase: 'showing', reason: 'login' })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Finance Manager')).toBeInTheDocument()
    expect(screen.getByText('Personal Finance')).toBeInTheDocument()
  })

  it('adds exit class when phase is exiting', () => {
    renderWithPhase({ phase: 'exiting', reason: 'logout' })
    expect(screen.getByRole('status').className).toContain('animate-scale-fade-out')
  })

  it('does not add exit class when phase is showing', () => {
    renderWithPhase({ phase: 'showing', reason: 'login' })
    expect(screen.getByRole('status').className).not.toContain('animate-scale-fade-out')
  })
})
