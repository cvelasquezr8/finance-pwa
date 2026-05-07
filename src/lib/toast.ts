import { toast as sonnerToast } from 'sonner'

interface ToastOpts {
  title?: string
  description?: string
  variant?: 'destructive' | 'default'
}

export function toast({ title, description, variant }: ToastOpts) {
  const msg = title ?? ''
  const opts = description ? { description } : undefined
  if (variant === 'destructive') return sonnerToast.error(msg, opts)
  return sonnerToast.success(msg, opts)
}
