import { useSearchParams, Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState } from '../components/ui/EmptyState'
import { filterByDate, sortRecordsDesc, summarize } from '../domain/aggregate'
import { addDays, today } from '../domain/date'
import { formatYuan } from '../domain/money'
import { getCategoryById } from '../domain/categories'
import { useRecordsStore } from '../store/recordsStore'

export function TodayPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dateParam = searchParams.get('date')
  const selectedDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today()
  const records = useRecordsStore((s) => s.records)

  const dayRecords = sortRecordsDesc(filterByDate(records, selectedDate))
  const summary = summarize(dayRecords)
  const isToday = selectedDate === today()

  const goDay = (offset: number) => {
    setSearchParams({ date: addDays(selectedDate, offset) })
  }

  return (
    <AppShell title={isToday ? '今日' : selectedDate}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goDay(-1)}
          className="rounded-md px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
        >
          前一天
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) setSearchParams({ date: e.target.value })
          }}
          className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1.5 text-sm"
          aria-label="选择日期"
        />
        <button
          type="button"
          onClick={() => goDay(1)}
          className="rounded-md px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-bg)]"
        >
          后一天
        </button>
      </div>

      <section
        className="mb-6 grid grid-cols-3 gap-2 border-b border-[var(--color-border)] pb-4 text-center"
        aria-label="日汇总"
      >
        <div>
          <p className="text-xs text-[var(--color-muted)]">收入</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-income)]">
            {formatYuan(summary.incomeCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">支出</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-expense)]">
            {formatYuan(summary.expenseCents)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-muted)]">结余</p>
          <p className="mt-1 text-sm font-semibold">{formatYuan(summary.balanceCents)}</p>
        </div>
      </section>

      <div className="mb-4">
        <Link
          to={`/records/new?date=${selectedDate}`}
          className="flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white"
        >
          记一笔
        </Link>
      </div>

      {dayRecords.length === 0 ? (
        <EmptyState
          message={isToday ? '今天还没有记录' : '这一天还没有记录'}
          actionTo={`/records/new?date=${selectedDate}`}
        />
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {dayRecords.map((record) => {
            const category = getCategoryById(record.categoryId)
            const isExpense = record.type === 'expense'
            return (
              <li key={record.id}>
                <Link
                  to={`/records/${record.id}/edit`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{category?.name ?? '未知分类'}</p>
                    {record.note ? (
                      <p className="truncate text-sm text-[var(--color-muted)]">{record.note}</p>
                    ) : null}
                  </div>
                  <p
                    className={[
                      'shrink-0 text-sm font-semibold',
                      isExpense ? 'text-[var(--color-expense)]' : 'text-[var(--color-income)]',
                    ].join(' ')}
                  >
                    {isExpense ? '-' : '+'}
                    {formatYuan(record.amountCents)}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </AppShell>
  )
}
