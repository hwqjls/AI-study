import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { breakdownByCategory, filterByMonth, summarize } from '../domain/aggregate'
import { addMonths, isCurrentMonth, today, toYearMonth } from '../domain/date'
import { formatYuan } from '../domain/money'
import { useRecordsStore } from '../store/recordsStore'

export function StatsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const monthParam = searchParams.get('month')
  const selectedMonth =
    monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : toYearMonth(today())

  const records = useRecordsStore((s) => s.records)
  const monthRecords = useMemo(
    () => filterByMonth(records, selectedMonth),
    [records, selectedMonth],
  )
  const summary = useMemo(() => summarize(monthRecords), [monthRecords])
  const expenseBars = useMemo(
    () => breakdownByCategory(monthRecords, 'expense'),
    [monthRecords],
  )

  const goMonth = (offset: number) => {
    setSearchParams({ month: addMonths(selectedMonth, offset) })
  }

  return (
    <AppShell title="月统计">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="rounded-md px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
        >
          上一月
        </button>
        <p className="text-sm font-medium">{selectedMonth}</p>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="rounded-md px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
        >
          下一月
        </button>
      </div>

      {!isCurrentMonth(selectedMonth) ? (
        <button
          type="button"
          onClick={() => setSearchParams({ month: toYearMonth(today()) })}
          className="mb-4 w-full rounded-md border border-[var(--color-border)] py-2 text-sm text-[var(--color-accent)]"
        >
          回到本月
        </button>
      ) : null}

      <section
        className="mb-6 grid grid-cols-3 gap-2 border-b border-[var(--color-border)] pb-4 text-center"
        aria-label="月汇总"
      >
        <div>
          <p className="text-xs text-[var(--color-muted)]">本月收入</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-income)]">
            {formatYuan(summary.incomeCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">本月支出</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-expense)]">
            {formatYuan(summary.expenseCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">结余</p>
          <p className="mt-1 text-sm font-semibold">{formatYuan(summary.balanceCents)}</p>
        </div>
      </section>

      <h2 className="mb-3 text-sm font-semibold">支出分类占比</h2>
      {expenseBars.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">本月暂无支出</p>
      ) : (
        <ul className="space-y-3">
          {expenseBars.map((item) => (
            <li key={item.categoryId}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-[var(--color-muted)]">{formatYuan(item.amountCents)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
                <div
                  className="h-full rounded-full bg-[var(--color-expense)]"
                  style={{ width: `${Math.max(item.ratio * 100, 2)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
