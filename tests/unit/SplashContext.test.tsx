import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { SplashProvider, useSplash } from '@/contexts/SplashContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SplashProvider>{children}</SplashProvider>
)

describe('SplashContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with idle phase', () => {
    const { result } = renderHook(() => useSplash(), { wrapper })
    expect(result.current.splashState.phase).toBe('idle')
    expect(result.current.splashState.reason).toBeNull()
  })

  it('transitions showing → exiting → idle and resolves the promise', async () => {
    const { result } = renderHook(() => useSplash(), { wrapper })
    let resolved = false

    act(() => {
      result.current.showSplash('login').then(() => {
        resolved = true
      })
    })

    expect(result.current.splashState.phase).toBe('showing')
    expect(result.current.splashState.reason).toBe('login')

    await act(async () => {
      vi.advanceTimersByTime(2200)
    })
    expect(result.current.splashState.phase).toBe('exiting')

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current.splashState.phase).toBe('idle')
    expect(resolved).toBe(true)
  })

  it('ignores concurrent calls while active', () => {
    const { result } = renderHook(() => useSplash(), { wrapper })

    act(() => {
      result.current.showSplash('login')
    })
    act(() => {
      result.current.showSplash('logout')
    })

    expect(result.current.splashState.reason).toBe('login')
  })

  it('throws outside provider', () => {
    expect(() => renderHook(() => useSplash())).toThrow(
      'useSplash must be used within SplashProvider'
    )
  })
})
