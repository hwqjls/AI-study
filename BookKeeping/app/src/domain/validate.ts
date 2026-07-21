import { getCategoryById } from './categories'
import { isValidDateString } from './date'
import { yuanToCents } from './money'
import type { LedgerRecord, RecordFormInput } from './types'

export type ValidationResult =
  | { ok: true; record: Omit<LedgerRecord, 'id' | 'createdAt' | 'updatedAt'> }
  | { ok: false; fieldErrors: Partial<Record<keyof RecordFormInput, string>> }

export function validateRecordInput(input: RecordFormInput): ValidationResult {
  const fieldErrors: Partial<Record<keyof RecordFormInput, string>> = {}

  if (input.type !== 'income' && input.type !== 'expense') {
    fieldErrors.type = '请选择收入或支出'
  }

  const cents = yuanToCents(input.amountYuan)
  if (cents === null) {
    fieldErrors.amountYuan = '金额必须大于 0，最多两位小数'
  }

  const category = getCategoryById(input.categoryId)
  if (!category) {
    fieldErrors.categoryId = '请选择分类'
  } else if (category.type !== input.type) {
    fieldErrors.categoryId = '分类与收支类型不匹配'
  }

  if (!isValidDateString(input.date)) {
    fieldErrors.date = '日期格式不正确'
  }

  if (input.note.length > 100) {
    fieldErrors.note = '备注不能超过 100 字'
  }

  if (Object.keys(fieldErrors).length > 0 || cents === null) {
    return { ok: false, fieldErrors }
  }

  return {
    ok: true,
    record: {
      type: input.type,
      amountCents: cents,
      categoryId: input.categoryId,
      date: input.date,
      note: input.note.trim(),
    },
  }
}
