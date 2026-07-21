import { useState, type FormEvent } from 'react'
import { categoriesForType } from '../../domain/categories'
import { today } from '../../domain/date'
import type { RecordFormInput, RecordType } from '../../domain/types'
import { useRecordsStore } from '../../store/recordsStore'

const DEFAULT_EXPENSE = 'exp-food'
const DEFAULT_INCOME = 'inc-salary'

function defaultCategory(type: RecordType): string {
  return type === 'expense' ? DEFAULT_EXPENSE : DEFAULT_INCOME
}

export interface AddTransactionProps {
  /** 预填日期，默认今天 */
  initialDate?: string
  /** 保存成功回调 */
  onSuccess?: (payload: { id: string; date: string }) => void
}

export function AddTransaction({ initialDate = today(), onSuccess }: AddTransactionProps) {
  const addRecord = useRecordsStore((s) => s.addRecord)

  const [type, setType] = useState<RecordType>('expense')
  const [amountYuan, setAmountYuan] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategory('expense'))
  const [date, setDate] = useState(initialDate)
  const [note, setNote] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RecordFormInput, string>>>(
    {},
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const categories = categoriesForType(type)

  const onTypeChange = (next: RecordType) => {
    setType(next)
    setCategoryId(defaultCategory(next))
    setFieldErrors((prev) => ({ ...prev, type: undefined, categoryId: undefined }))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setFormError(null)
    setFieldErrors({})

    const input: RecordFormInput = {
      type,
      amountYuan,
      categoryId,
      date,
      note,
    }

    setSubmitting(true)
    const result = addRecord(input)
    setSubmitting(false)

    if (!result.ok) {
      setFieldErrors(result.fieldErrors ?? {})
      setFormError(result.error)
      return
    }

    onSuccess?.({ id: result.id, date })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
        <label htmlFor="add-amount" className="mb-1 block text-sm font-medium">
          金额（元）
        </label>
        <input
          id="add-amount"
          name="amountYuan"
          inputMode="decimal"
          enterKeyHint="done"
          value={amountYuan}
          onChange={(e) => setAmountYuan(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          autoComplete="off"
          required
          aria-invalid={Boolean(fieldErrors.amountYuan)}
          aria-describedby={fieldErrors.amountYuan ? 'add-amount-error' : undefined}
        />
        {fieldErrors.amountYuan ? (
          <p id="add-amount-error" className="mt-1 text-xs text-[var(--color-expense)]">
            {fieldErrors.amountYuan}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-category" className="mb-1 block text-sm font-medium">
          分类
        </label>
        <select
          id="add-category"
          name="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          aria-invalid={Boolean(fieldErrors.categoryId)}
          aria-describedby={fieldErrors.categoryId ? 'add-category-error' : undefined}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId ? (
          <p id="add-category-error" className="mt-1 text-xs text-[var(--color-expense)]">
            {fieldErrors.categoryId}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-date" className="mb-1 block text-sm font-medium">
          日期
        </label>
        <input
          id="add-date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          aria-invalid={Boolean(fieldErrors.date)}
          aria-describedby={fieldErrors.date ? 'add-date-error' : undefined}
        />
        {fieldErrors.date ? (
          <p id="add-date-error" className="mt-1 text-xs text-[var(--color-expense)]">
            {fieldErrors.date}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-note" className="mb-1 block text-sm font-medium">
          备注（可选）
        </label>
        <input
          id="add-note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-base"
          aria-invalid={Boolean(fieldErrors.note)}
          aria-describedby={fieldErrors.note ? 'add-note-error' : undefined}
        />
        {fieldErrors.note ? (
          <p id="add-note-error" className="mt-1 text-xs text-[var(--color-expense)]">
            {fieldErrors.note}
          </p>
        ) : null}
      </div>

      {formError ? <p className="text-sm text-[var(--color-expense)]">{formError}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--color-accent)] py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? '保存中…' : '保存'}
      </button>
    </form>
  )
}
