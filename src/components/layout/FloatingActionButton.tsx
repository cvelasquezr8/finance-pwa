import { useState } from 'react'
import { Plus, ArrowLeftRight, CalendarClock, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { BalanceAdjustmentModal } from '@/modules/dashboard/components/BalanceAdjustmentModal'
import { AddScheduledExpenseModal } from '@/modules/transactions/components/AddScheduledExpenseModal'
import { AddTransactionModal } from '@/modules/transactions/components/AddTransactionModal'
import { balanceService, transactionService } from '@/services/TransactionService'
import { toast } from '@/components/ui/use-toast'
import { getQuincena } from '@/lib/utils'
import type { MonthFilter, QuincenaFilter } from '@/core/types'
import type { ScheduledExpenseFormValues, AddTransactionFormValues } from '@/modules/transactions/schemas/transactionSchemas'

type ActiveModal = 'transaction' | 'scheduled' | 'balance' | null

function useCurrentFilter(): MonthFilter & { quincena: QuincenaFilter } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear(), quincena: getQuincena(now) }
}

const dispatch = () => window.dispatchEvent(new CustomEvent('financeDataChanged'))

export function FloatingActionButton() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const filter = useCurrentFilter()
  const [isOpen, setIsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [currentBalance] = useState<number>(0)

  if (!user) return null

  const fabActions = [
    {
      id: 'transaction' as const,
      label: t('fab.addTransaction'),
      icon: ArrowLeftRight,
      color: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
    {
      id: 'scheduled' as const,
      label: t('fab.scheduledExpense'),
      icon: CalendarClock,
      color: 'bg-violet-600 text-white hover:bg-violet-500',
    },
    {
      id: 'balance' as const,
      label: t('fab.adjustBalance'),
      icon: SlidersHorizontal,
      color: 'bg-card text-foreground border border-border hover:bg-accent',
    },
  ]

  const openModal = (id: ActiveModal) => {
    setIsOpen(false)
    setActiveModal(id)
  }

  const handleAdjust = async (newBalance: number, reason: string) => {
    try {
      const now = new Date()
      await balanceService.adjust({ newBalance, reason, adjustmentDate: now.toISOString() })
      toast({ title: t('fab.balanceAdjusted') })
      dispatch()
    } catch {
      toast({ title: t('fab.balanceError'), variant: 'destructive' })
    }
  }

  const handleAddTransaction = async (
    mode: 'income' | 'egreso',
    description: string,
    amount: number,
    category: AddTransactionFormValues['category'],
    isCC: boolean,
    receipt: File | null,
    f: MonthFilter & { quincena: QuincenaFilter }
  ) => {
    try {
      const quincena = f.quincena === 'mensual' ? (new Date().getDate() <= 15 ? 'primera' : 'segunda') : f.quincena
      const tx = await transactionService.create({
        description, amount,
        category: category ?? 'otros',
        type: mode === 'income' ? 'income' : 'daily',
        quincena,
        dueDay: new Date().getDate(),
        month: f.month, year: f.year,
        isRecurring: false,
        isCC: mode === 'income' ? false : isCC,
      })
      if (receipt) {
        try { await transactionService.uploadReceipt(tx.id, receipt) } catch { /* best effort */ }
      }
      toast({ title: mode === 'income' ? t('fab.incomeAdded') : t('fab.expenseAdded'), description })
      dispatch()
    } catch {
      toast({ title: t('fab.transactionError'), variant: 'destructive' })
    }
  }

  const handleAddScheduled = async (data: ScheduledExpenseFormValues, f: MonthFilter) => {
    try {
      await transactionService.create({
        description: data.description,
        amount: data.amount,
        category: data.category,
        type: 'scheduled',
        quincena: data.quincena,
        dueDay: data.dueDay,
        month: f.month, year: f.year,
        isRecurring: data.isRecurring,
        isCC: data.isCC ?? false,
      })
      toast({ title: t('fab.scheduledAdded'), description: data.description })
      dispatch()
    } catch {
      toast({ title: t('fab.scheduledError'), variant: 'destructive' })
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
        <div className={`flex flex-col items-end gap-3 transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {fabActions.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => openModal(id)}
              className={`flex items-center gap-3 rounded-full shadow-lg px-4 py-2.5 text-sm font-medium transition-colors ${color}`}
            >
              <span>{label}</span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform duration-200 hover:bg-primary/90 active:scale-95"
          aria-label={t('fab.actions')}
        >
          <Plus className={`h-6 w-6 transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
        </button>
      </div>

      <AddTransactionModal
        filter={filter}
        onAdd={handleAddTransaction}
        open={activeModal === 'transaction'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
      <AddScheduledExpenseModal
        filter={filter}
        onAdd={handleAddScheduled}
        open={activeModal === 'scheduled'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
      <BalanceAdjustmentModal
        currentBalance={currentBalance}
        onAdjust={handleAdjust}
        open={activeModal === 'balance'}
        onOpenChange={(o) => !o && setActiveModal(null)}
      />
    </>
  )
}
