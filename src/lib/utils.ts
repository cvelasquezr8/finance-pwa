import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, getDaysInMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy', { locale: es })
}

export function getQuincena(date = new Date()) {
  return date.getDate() <= 15 ? 'primera' : 'segunda'
}

export function getQuincenaDays(quincena: 'primera' | 'segunda', month: number, year: number) {
  if (quincena === 'primera') return { start: 1, end: 15 }
  return { start: 16, end: getDaysInMonth(new Date(year, month - 1)) }
}

export function getRemainingDaysInMonth(date = new Date()): number {
  const total = getDaysInMonth(date)
  return Math.max(1, total - date.getDate())
}

export function getQuincenaDateRangeLabel(
  quincena: 'primera' | 'segunda' | 'mensual',
  month: number,
  year: number
): string | null {
  if (quincena === 'mensual') return null
  const { start, end } = getQuincenaDays(quincena, month, year)
  return `Días ${start}–${end}`
}

export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const CATEGORY_LABELS: Record<string, string> = {
  vivienda: 'Vivienda',
  servicios: 'Servicios',
  alimentacion: 'Alimentación',
  transporte: 'Transporte',
  salud: 'Salud',
  entretenimiento: 'Entretenimiento',
  educacion: 'Educación',
  deuda: 'Deuda',
  otros: 'Otros',
}

export const CATEGORY_COLORS: Record<string, string> = {
  vivienda: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  servicios: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  alimentacion: 'bg-green-500/20 text-green-700 dark:text-green-400',
  transporte: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  salud: 'bg-red-500/20 text-red-700 dark:text-red-400',
  entretenimiento: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
  educacion: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
  deuda: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  otros: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
}
