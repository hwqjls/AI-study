import { Link } from 'react-router-dom'

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
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-[var(--color-muted)]">{message}</p>
      <Link
        to={actionTo}
        className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
      >
        {actionLabel}
      </Link>
    </div>
  )
}
