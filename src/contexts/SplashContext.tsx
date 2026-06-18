'use client'

import { createContext, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type SplashPhase = 'idle' | 'showing' | 'exiting'
export type SplashReason = 'login' | 'logout'

export interface SplashState {
  phase: SplashPhase
  reason: SplashReason | null
}

interface SplashContextValue {
  splashState: SplashState
  showSplash: (reason: SplashReason) => Promise<void>
}

export const SplashContext = createContext<SplashContextValue | null>(null)

const DISPLAY_MS = 2_200
const EXIT_MS = 400

export function SplashProvider({ children }: { children: ReactNode }) {
  const [splashState, setSplashState] = useState<SplashState>({ phase: 'idle', reason: null })
  const activeRef = useRef(false)

  const showSplash = (reason: SplashReason): Promise<void> => {
    if (activeRef.current) return Promise.resolve()
    activeRef.current = true

    return new Promise<void>((resolve) => {
      setSplashState({ phase: 'showing', reason })

      setTimeout(() => {
        setSplashState((s) => ({ ...s, phase: 'exiting' }))

        setTimeout(() => {
          setSplashState({ phase: 'idle', reason: null })
          activeRef.current = false
          resolve()
        }, EXIT_MS)
      }, DISPLAY_MS)
    })
  }

  return (
    <SplashContext.Provider value={{ splashState, showSplash }}>{children}</SplashContext.Provider>
  )
}

export function useSplash(): SplashContextValue {
  const ctx = useContext(SplashContext)
  if (!ctx) throw new Error('useSplash must be used within SplashProvider')
  return ctx
}
