'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useSplash } from '@/contexts/SplashContext'

export function SplashScreen() {
  const { splashState } = useSplash()
  const { phase } = splashState
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && phase !== 'idle') {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
  }, [phase])

  if (phase === 'idle') return null

  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        isDark ? 'bg-[hsl(20_11%_10%)]' : 'bg-[hsl(30_25%_96%)]',
        phase === 'exiting' ? 'animate-scale-fade-out' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="relative flex h-[120px] w-[120px] items-center justify-center">
        <div
          className="absolute h-[112px] w-[112px] rounded-full border-[3px] border-transparent border-r-amber-500 border-t-amber-500 motion-safe:animate-spin"
          style={{ animationDuration: '1.4s' }}
        />
        <div
          className="absolute h-[84px] w-[84px] rounded-full border-[3px] border-transparent border-b-amber-500 border-l-amber-500 opacity-50 motion-safe:animate-spin"
          style={{ animationDuration: '1.9s', animationDirection: 'reverse' }}
        />
        <div className="absolute h-[66px] w-[66px] rounded-full bg-[radial-gradient(circle,hsl(38_92%_50%/.25)_0%,transparent_70%)] motion-safe:animate-pulse" />
        <div
          className={[
            'relative z-10 flex h-[44px] w-[44px] items-center justify-center rounded-[12px]',
            'shadow-[0_4px_20px_hsl(38_92%_50%/.35)]',
            isDark ? 'bg-amber-500' : 'bg-[hsl(20_14%_12%)]',
          ].join(' ')}
        >
          <TrendingUp
            size={24}
            strokeWidth={2.3}
            className={isDark ? 'text-[hsl(20_11%_10%)]' : 'text-[hsl(30_25%_96%)]'}
          />
        </div>
      </div>

      <div className="mt-[26px] text-center">
        <p
          className={[
            'text-[15px] font-extrabold uppercase tracking-[.2em]',
            isDark ? 'text-[hsl(30_18%_93%)]' : 'text-[hsl(20_14%_11%)]',
          ].join(' ')}
        >
          Finance Manager
        </p>
        <p className="mt-[3px] text-[9px] uppercase tracking-[.15em] text-amber-500">
          Personal Finance
        </p>
        <div className="mt-[14px] flex justify-center gap-[6px]">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="h-[6px] w-[6px] rounded-full bg-amber-500 motion-safe:animate-bounce"
              style={{ animationDelay: `${delay}ms`, animationDuration: '1.2s' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
