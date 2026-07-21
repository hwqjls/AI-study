import { useState, type FormEvent, type FocusEvent } from 'react'
import { categoriesForType } from '../../domain/categories'
import { today } from '../../domain/date'
import type { RecordFormInput, RecordType } from '../../domain/types'
import { validateRecordInput } from '../../domain/validate'
import { useRecordsStore } from '../../store/recordsStore'

const DEFAULT_EXPENSE = 'exp-food'
const DEFAULT_INCOME = 'inc-salary'

function defaultCategory(type: RecordType): string {
  return type === 'expense' ? DEFAULT_EXPENSE : DEFAULT_INCOME
}

type FieldErrors = Partial<Record<keyof RecordFormInput, string>>

export interface AddTransactionProps {
  initialDate?: string
  onSuccess?: (payload: { id: string; date: string }) => void
}

export function AddTransaction({ initialDate = today(), onSuccess }: AddTransactionProps) {
  const addRecord = useRecordsStore((s) => s.addRecord)

  const [type, setType] = useState<RecordType>('expense')
  const [amountYuan, setAmountYuan] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategory('expense'))
  const [date, setDate] = useState(initialDate)
  const [note, setNote] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const categories = categoriesForType(type)

  const buildInput = (): RecordFormInput => ({
    type,
    amountYuan,
    categoryId,
    date,
    note,
  })

  const validateForm = (input: RecordFormInput): FieldErrors | null => {
    const result = validateRecordInput(input)
    if (result.ok) return null
    return result.fieldErrors
  }

  const clearFieldError = (field: keyof RecordFormInput) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateField = (field: keyof RecordFormInput, input = buildInput()) => {
    const errors = validateForm(input)
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (errors?.[field]) {
        next[field] = errors[field]
      } else {
        delete next[field]
      }
      return next
    })
  }

  const onTypeChange = (next: RecordType) => {
    const nextCategoryId = defaultCategory(next)
    setType(next)
    setCategoryId(nextCategoryId)
    clearFieldError('type')
    clearFieldError('categoryId')
    validateField('categoryId', {
      type: next,
      amountYuan,
      categoryId: nextCategoryId,
      date,
      note,
    })
  }

  const onFieldBlur =
    (field: keyof RecordFormInput) => (_e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      validateField(field)
    }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setFormError(null)
    const input = buildInput()
    const errors = validateForm(input)

    if (errors) {
      setFieldErrors(errors)
      setFormError('请检查表单填写')
      return
    }

    setFieldErrors({})
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
    <form onSubmit={onSubmit} className="app-card space-y-5 p-5" noValidate>
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
        <label htmlFor="add-amount" className="mb-2 block text-sm font-semibold">
          金额（元）
        </label>
        <input
          id="add-amount"
          name="amountYuan"
          inputMode="decimal"
          enterKeyHint="done"
          value={amountYuan}
          onChange={(e) => {
            setAmountYuan(e.target.value)
            clearFieldError('amountYuan')
          }}
          onBlur={onFieldBlur('amountYuan')}
          placeholder="0.00"
          className="app-input text-lg font-semibold tabular-nums"
          autoComplete="off"
          aria-invalid={Boolean(fieldErrors.amountYuan)}
          aria-describedby={fieldErrors.amountYuan ? 'add-amount-error' : undefined}
        />
        {fieldErrors.amountYuan ? (
          <p id="add-amount-error" className="field-error">
            {fieldErrors.amountYuan}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-category" className="mb-2 block text-sm font-semibold">
          分类
        </label>
        <select
          id="add-category"
          name="categoryId"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value)
            clearFieldError('categoryId')
          }}
          onBlur={onFieldBlur('categoryId')}
          className="app-input"
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
          <p id="add-category-error" className="field-error">
            {fieldErrors.categoryId}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-date" className="mb-2 block text-sm font-semibold">
          日期
        </label>
        <input
          id="add-date"
          name="date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            clearFieldError('date')
          }}
          onBlur={onFieldBlur('date')}
          className="app-input"
          aria-invalid={Boolean(fieldErrors.date)}
          aria-describedby={fieldErrors.date ? 'add-date-error' : undefined}
        />
        {fieldErrors.date ? (
          <p id="add-date-error" className="field-error">
            {fieldErrors.date}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="add-note" className="mb-2 block text-sm font-semibold">
          备注（可选）
        </label>
        <input
          id="add-note"
          name="note"
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            clearFieldError('note')
          }}
          onBlur={onFieldBlur('note')}
          maxLength={100}
          placeholder="添加备注…"
          className="app-input"
          aria-invalid={Boolean(fieldErrors.note)}
          aria-describedby={fieldErrors.note ? 'add-note-error' : undefined}
        />
        {fieldErrors.note ? (
          <p id="add-note-error" className="field-error">
            {fieldErrors.note}
          </p>
        ) : null}
      </div>

      {formError ? <p className="text-sm text-[var(--color-error)]">{formError}</p> : null}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? '保存中…' : '保存'}
      </button>
    </form>
  )
}
