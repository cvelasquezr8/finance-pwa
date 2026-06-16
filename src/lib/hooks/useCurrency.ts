import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'

export function useCurrency() {
  const { user } = useAuth()
  const currency = user?.currency ?? 'MXN'
  return (amount: number) => formatCurrency(amount, currency)
}
