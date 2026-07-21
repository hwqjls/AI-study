import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { MonthStepper } from '../components/ui/DateStepper'
import { SummaryGrid } from '../components/ui/SummaryGrid'
import { breakdownByCategory, filterByMonth, summarize } from '../domain/aggregate'
import { addMonths, isCurrentMonth, today, toYearMonth } from '../domain/date'
import { formatYuan } from '../domain/money'
import { useRecordsStore } from '../store/recordsStore'

function formatMonthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-')
  return `${y}年${Number(m)}月`
}

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

  return (
    <AppShell title="月统计" subtitle={formatMonthLabel(selectedMonth)}>
      <MonthStepper
        label={formatMonthLabel(selectedMonth)}
        onPrev={() => setSearchParams({ month: addMonths(selectedMonth, -1) })}
        onNext={() => setSearchParams({ month: addMonths(selectedMonth, 1) })}
      />

      {!isCurrentMonth(selectedMonth) ? (
        <button
          type="button"
          onClick={() => setSearchParams({ month: toYearMonth(today()) })}
          className="btn-outline mb-5 w-full"
        >
          回到本月
        </button>
      ) : null}

      <SummaryGrid
        summary={summary}
        labels={{ income: '本月收入', expense: '本月支出', balance: '结余' }}
      />

      <section>
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">支出分类占比</h2>
        {expenseBars.length === 0 ? (
          <div className="app-card py-12 text-center text-sm text-[var(--color-muted)]">
            本月暂无支出
          </div>
        ) : (
          <ul className="app-card space-y-4 p-4">
            {expenseBars.map((item) => (
              <li key={item.categoryId}>
                <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-[var(--color-text)]">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-[var(--color-muted)]">
                    {formatYuan(item.amountCents)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--color-bg)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-expense)] to-emerald-400 transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(item.ratio * 100, 3)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  )
}
