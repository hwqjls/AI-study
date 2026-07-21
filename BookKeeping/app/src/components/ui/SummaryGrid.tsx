import type { DaySummary } from '../../domain/types'
import { formatYuan } from '../../domain/money'

interface SummaryGridProps {
  summary: DaySummary
  labels?: {
    income: string
    expense: string
    balance: string
  }
}

export function SummaryGrid({
  summary,
  labels = { income: '收入', expense: '支出', balance: '结余' },
}: SummaryGridProps) {
  const items = [
    {
      label: labels.income,
      value: formatYuan(summary.incomeCents),
      colorClass: 'text-[var(--color-income)]',
      bgClass: 'bg-[var(--color-income-soft)]',
    },
    {
      label: labels.expense,
      value: formatYuan(summary.expenseCents),
      colorClass: 'text-[var(--color-expense)]',
      bgClass: 'bg-[var(--color-expense-soft)]',
    },
    {
      label: labels.balance,
      value: formatYuan(summary.balanceCents),
      colorClass: 'text-[var(--color-text)]',
      bgClass: 'bg-[var(--color-surface-muted)]',
    },
  ]

  return (
    <section className="app-card mb-6 grid grid-cols-3 gap-3 p-4" aria-label="汇总">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-[var(--radius-lg)] px-2 py-3 text-center ${item.bgClass}`}
        >
          <p className="text-xs font-medium text-[var(--color-muted)]">{item.label}</p>
          <p className={`mt-1.5 text-sm font-bold tracking-tight ${item.colorClass}`}>
            {item.value}
          </p>
        </div>
      ))}
    </section>
  )
}
