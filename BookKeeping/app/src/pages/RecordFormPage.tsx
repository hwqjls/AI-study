import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AddTransaction } from '../components/form/AddTransaction'
import { AppShell } from '../components/layout/AppShell'
import { categoriesForType } from '../domain/categories'
import { centsToYuanNumber } from '../domain/money'
import { today } from '../domain/date'
import type { RecordFormInput, RecordType } from '../domain/types'
import { useRecordsStore } from '../store/recordsStore'

const DEFAULT_EXPENSE = 'exp-food'
const DEFAULT_INCOME = 'inc-salary'

function defaultCategory(type: RecordType): string {
  return type === 'expense' ? DEFAULT_EXPENSE : DEFAULT_INCOME
}

export function RecordFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const records = useRecordsStore((s) => s.records)
  const updateRecord = useRecordsStore((s) => s.updateRecord)
  const removeRecord = useRecordsStore((s) => s.removeRecord)

  const existing = useMemo(
    () => (id ? records.find((r) => r.id === id) : undefined),
    [id, records],
  )

  const prefillDate = searchParams.get('date')
  const initialDate =
    existing?.date ??
    (prefillDate && /^\d{4}-\d{2}-\d{2}$/.test(prefillDate) ? prefillDate : today())

  const [type, setType] = useState<RecordType>(existing?.type ?? 'expense')
  const [amountYuan, setAmountYuan] = useState(
    existing ? centsToYuanNumber(existing.amountCents).toFixed(2) : '',
  )
  const [categoryId, setCategoryId] = useState(
    existing?.categoryId ?? defaultCategory(existing?.type ?? 'expense'),
  )
  const [date, setDate] = useState(initialDate)
  const [note, setNote] = useState(existing?.note ?? '')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RecordFormInput, string>>>(
    {},
  )
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!existing) return
    setType(existing.type)
    setAmountYuan(centsToYuanNumber(existing.amountCents).toFixed(2))
    setCategoryId(existing.categoryId)
    setDate(existing.date)
    setNote(existing.note)
  }, [existing])

  if (isEdit && !existing) {
    return <Navigate to="/" replace />
  }

  const onAddSuccess = ({ date: savedDate }: { id: string; date: string }) => {
    navigate(`/?date=${savedDate}`)
  }

  if (!isEdit) {
    return (
      <AppShell title="记一笔" hideNav>
        <div className="mb-4">
          <Link to={`/?date=${initialDate}`} className="text-sm text-[var(--color-accent)]">
            ← 返回
          </Link>
        </div>
        <AddTransaction initialDate={initialDate} onSuccess={onAddSuccess} />
      </AppShell>
    )
  }

  const categories = categoriesForType(type)

  const onTypeChange = (next: RecordType) => {
    setType(next)
    setCategoryId(defaultCategory(next))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setFormError(null)
    const input: RecordFormInput = {
      type,
      amountYuan,
      categoryId,
      date,
      note,
    }
    const result = updateRecord(id, input)
    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }
    navigate(`/?date=${date}`)
  }

  const onDelete = () => {
    if (!id) return
    if (!window.confirm('删除这条记录？')) return
    const result = removeRecord(id)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    navigate(`/?date=${date}`)
  }

  return (
    <AppShell title="编辑记录" hideNav>
      <div className="mb-4">
        <Link to={`/?date=${date}`} className="text-sm text-[var(--color-accent)]">
          ← 返回
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">类型</legend>
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={[
                  'flex-1 rounded-lg border py-2.5 text-sm font-medium',
                  type === t
                    ? t === 'expense'
                      ? 'border-[var(--color-expense)] bg-orange-50 text-[var(--color-expense)]'
                      : 'border-[var(--color-income)] bg-green-50 text-[var(--color-income)]'
                    : 'border-[var(--color-border)] text-[var(--color-muted)]',
                ].join(' ')}
              >
                {t === 'expense' ? '支出' : '收入'}
              </button>
            ))}
          </div>
          {fieldErrors.type ? (
            <p className="mt-1 text-xs text-[var(--color-expense)]">{fieldErrors.type}</p>
          ) : null}
        </fieldset>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium">
            金额（元）
          </label>
          <input
            id="amount"
            inputMode="decimal"
            enterKeyHint="done"
            value={amountYuan}
            onChange={(e) => setAmountYuan(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
            autoComplete="off"
          />
          {fieldErrors.amountYuan ? (
            <p className="mt-1 text-xs text-[var(--color-expense)]">{fieldErrors.amountYuan}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            分类
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId ? (
            <p className="mt-1 text-xs text-[var(--color-expense)]">{fieldErrors.categoryId}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">
            日期
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          />
          {fieldErrors.date ? (
            <p className="mt-1 text-xs text-[var(--color-expense)]">{fieldErrors.date}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium">
            备注（可选）
          </label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          />
          {fieldErrors.note ? (
            <p className="mt-1 text-xs text-[var(--color-expense)]">{fieldErrors.note}</p>
          ) : null}
        </div>

        {formError ? <p className="text-sm text-[var(--color-expense)]">{formError}</p> : null}

        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white"
        >
          保存
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-lg border border-[var(--color-expense)] py-3 text-sm font-medium text-[var(--color-expense)]"
        >
          删除
        </button>
      </form>
    </AppShell>
  )
}
