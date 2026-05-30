'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MonthFilter as MonthFilterType, QuincenaFilter } from '@/core/types'

interface Props {
  filter: MonthFilterType & { quincena: QuincenaFilter }
  onChange: (filter: MonthFilterType & { quincena: QuincenaFilter }) => void
}

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

export function MonthFilter({ filter, onChange }: Props) {
  const { t } = useTranslation()

  const months = t('months', { returnObjects: true }) as string[]

  const quincenaOptions: { value: QuincenaFilter; label: string; short: string }[] = [
    { value: 'primera', label: t('quincena.primera'), short: 'Q1' },
    { value: 'segunda', label: t('quincena.segunda'), short: 'Q2' },
    { value: 'mensual', label: t('quincena.mensual'), short: t('quincena.mensual') },
  ]

  const prev = () => {
    const d = new Date(filter.year, filter.month - 2)
    onChange({ ...filter, month: d.getMonth() + 1, year: d.getFullYear() })
  }
  const next = () => {
    const d = new Date(filter.year, filter.month)
    onChange({ ...filter, month: d.getMonth() + 1, year: d.getFullYear() })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select
          value={filter.month.toString()}
          onValueChange={(v) => onChange({ ...filter, month: Number(v) })}
        >
          <SelectTrigger className="h-8 w-28 sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filter.year.toString()}
          onValueChange={(v) => onChange({ ...filter, year: Number(v) })}
        >
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex rounded-lg border border-border p-0.5">
        {quincenaOptions.map(({ value, label, short }) => (
          <button
            key={value}
            onClick={() => onChange({ ...filter, quincena: value })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 ${
              filter.quincena === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
