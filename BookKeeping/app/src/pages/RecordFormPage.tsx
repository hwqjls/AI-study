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
        <Link
          to={`/?date=${initialDate}`}
          className="btn-ghost -ml-2 mb-4 inline-flex text-[var(--color-primary)]"
        >
          ← 返回
        </Link>
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
      <Link
        to={`/?date=${date}`}
        className="btn-ghost -ml-2 mb-4 inline-flex text-[var(--color-primary)]"
      >
        ← 返回
      </Link>

      <form onSubmit={onSubmit} className="app-card space-y-5 p-5">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-[var(--color-text)]">类型</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['expense', 'income'] as const).map((t) => {
              const selected = type === t
              const isExpense = t === 'expense'
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTypeChange(t)}
                  className={[
                    'min-h-[48px] cursor-pointer rounded-[var(--radius-md)] border-2 py-3 text-sm font-semibold transition-all duration-200',
                    selected
                      ? isExpense
                        ? 'border-[var(--color-expense)] bg-[var(--color-expense-soft)] text-[var(--color-expense)]'
                        : 'border-[var(--color-income)] bg-[var(--color-income-soft)] text-[var(--color-income)]'
                      : 'border-transparent bg-[var(--color-surface-muted)] text-[var(--color-muted)] hover:text-[var(--color-text)]',
                  ].join(' ')}
                >
                  {isExpense ? '支出' : '收入'}
                </button>
              )
            })}
          </div>
          {fieldErrors.type ? <p className="field-error">{fieldErrors.type}</p> : null}
        </fieldset>

        <div>
          <label htmlFor="amount" className="mb-2 block text-sm font-semibold">
            金额（元）
          </label>
          <input
            id="amount"
            inputMode="decimal"
            enterKeyHint="done"
            value={amountYuan}
            onChange={(e) => setAmountYuan(e.target.value)}
            placeholder="0.00"
            className="app-input text-lg font-semibold tabular-nums"
            autoComplete="off"
          />
          {fieldErrors.amountYuan ? <p className="field-error">{fieldErrors.amountYuan}</p> : null}
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-semibold">
            分类
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="app-input"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId ? (
            <p className="field-error">{fieldErrors.categoryId}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-semibold">
            日期
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="app-input"
          />
          {fieldErrors.date ? <p className="field-error">{fieldErrors.date}</p> : null}
        </div>

        <div>
          <label htmlFor="note" className="mb-2 block text-sm font-semibold">
            备注（可选）
          </label>
          <input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={100}
            placeholder="添加备注…"
            className="app-input"
          />
          {fieldErrors.note ? <p className="field-error">{fieldErrors.note}</p> : null}
        </div>

        {formError ? <p className="text-sm text-[var(--color-error)]">{formError}</p> : null}

        <button type="submit" className="btn-primary w-full">
          保存
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="w-full cursor-pointer rounded-[var(--radius-md)] border-2 border-[var(--color-error)] py-3 text-sm font-semibold text-[var(--color-error)] transition-colors duration-200 hover:bg-red-50"
        >
          删除
        </button>
      </form>
    </AppShell>
  )
}
