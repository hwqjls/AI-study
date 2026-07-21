import { useSearchParams, Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { EmptyState } from '../components/ui/EmptyState'
import { DateStepper } from '../components/ui/DateStepper'
import { SummaryGrid } from '../components/ui/SummaryGrid'
import { IconPlus } from '../components/ui/icons'
import { filterByDate, sortRecordsDesc, summarize } from '../domain/aggregate'
import { addDays, today } from '../domain/date'
import { formatYuan } from '../domain/money'
import { getCategoryById } from '../domain/categories'
import { useRecordsStore } from '../store/recordsStore'

function formatDisplayDate(date: string): string {
  const [y, m, d] = date.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

export function TodayPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const dateParam = searchParams.get('date')
  const selectedDate = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today()
  const records = useRecordsStore((s) => s.records)

  const dayRecords = sortRecordsDesc(filterByDate(records, selectedDate))
  const summary = summarize(dayRecords)
  const isToday = selectedDate === today()

  return (
    <AppShell
      title={isToday ? '今日' : '流水'}
      subtitle={isToday ? formatDisplayDate(selectedDate) : undefined}
    >
      <DateStepper
        value={selectedDate}
        displayLabel={isToday ? undefined : formatDisplayDate(selectedDate)}
        onChange={(date) => setSearchParams({ date })}
        onPrev={() => setSearchParams({ date: addDays(selectedDate, -1) })}
        onNext={() => setSearchParams({ date: addDays(selectedDate, 1) })}
      />

      <SummaryGrid summary={summary} />

      <Link
        to={`/records/new?date=${selectedDate}`}
        className="btn-primary mb-6 w-full"
      >
        <IconPlus className="h-4 w-4" aria-hidden />
        记一笔
      </Link>

      {dayRecords.length === 0 ? (
        <EmptyState
          message={isToday ? '今天还没有记录，记下第一笔吧' : '这一天还没有记录'}
          actionTo={`/records/new?date=${selectedDate}`}
        />
      ) : (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">当日明细</h2>
          <ul className="app-card divide-y divide-[var(--color-border)] overflow-hidden">
            {dayRecords.map((record) => {
              const category = getCategoryById(record.categoryId)
              const isExpense = record.type === 'expense'
              return (
                <li key={record.id}>
                  <Link
                    to={`/records/${record.id}/edit`}
                    className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-text)]">
                        {category?.name ?? '未知分类'}
                      </p>
                      {record.note ? (
                        <p className="mt-0.5 truncate text-sm text-[var(--color-muted)]">
                          {record.note}
                        </p>
                      ) : null}
                    </div>
                    <p
                      className={[
                        'shrink-0 text-sm font-bold tabular-nums',
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
        </section>
      )}
    </AppShell>
  )
}
