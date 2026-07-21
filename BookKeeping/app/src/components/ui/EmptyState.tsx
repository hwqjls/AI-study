import { Link } from 'react-router-dom'
import { IconReceipt } from './icons'

interface EmptyStateProps {
  message: string
  actionLabel?: string
  actionTo?: string
}

export function EmptyState({
  message,
  actionLabel = '记一笔',
  actionTo = '/records/new',
}: EmptyStateProps) {
  return (
    <div className="app-card flex flex-col items-center gap-4 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted)]">
        <IconReceipt className="h-7 w-7" aria-hidden />
      </div>
      <p className="max-w-[16rem] text-sm leading-relaxed text-[var(--color-muted)]">{message}</p>
      <Link to={actionTo} className="btn-primary">
        {actionLabel}
      </Link>
    </div>
  )
}
