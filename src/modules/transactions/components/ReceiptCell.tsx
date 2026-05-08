import { useRef, useState } from 'react'
import { Eye, Paperclip, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { transactionService } from '@/services/TransactionService'
import { toast } from '@/lib/toast'

interface Props {
  transactionId: string
  description: string
  receiptUrl: string | null
  onUploaded?: (updatedReceiptUrl: string) => void
  readOnly?: boolean
}

export function ReceiptCell({
  transactionId,
  description,
  receiptUrl,
  onUploaded,
  readOnly = false,
}: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('receipt.tooBig'),
        description: t('receipt.tooBigDesc'),
        variant: 'destructive',
      })
      return
    }
    setUploading(true)
    try {
      const tx = await transactionService.uploadReceipt(transactionId, file)
      if (tx.receiptUrl) onUploaded?.(tx.receiptUrl)
      queryClient.invalidateQueries({ queryKey: ['transactions'], exact: false })
      toast({ title: t('receipt.saved') })
    } catch {
      toast({ title: t('receipt.error'), variant: 'destructive' })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const isPdf = receiptUrl?.startsWith('data:application/pdf')

  return (
    <div className="flex items-center justify-center gap-1">
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label={t('receipt.upload')}
            title={receiptUrl ? t('receipt.replace') : t('receipt.upload')}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Paperclip
                className={`h-3.5 w-3.5 ${receiptUrl ? 'text-violet-600 dark:text-violet-400' : ''}`}
              />
            )}
          </Button>
        </>
      )}

      {receiptUrl && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          onClick={() => setPreviewOpen(true)}
          aria-label={t('receipt.view')}
          title={t('receipt.view')}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">{t('receipt.title', { description })}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex items-center justify-center rounded-lg border border-border bg-muted/20 p-2">
            {isPdf ? (
              <iframe
                src={receiptUrl!}
                title={t('receipt.pdfTitle')}
                className="h-[70vh] w-full rounded"
              />
            ) : (
              <img
                src={receiptUrl!}
                alt={t('receipt.view')}
                className="max-h-[70vh] w-auto rounded object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
