/** 收支类型 */
export type RecordType = 'income' | 'expense'

/** 持久化的一条记账（金额单位：分） */
export interface LedgerRecord {
  id: string
  type: RecordType
  amountCents: number
  categoryId: string
  date: string
  note: string
  createdAt: string
  updatedAt: string
}

/** 表单输入（金额用元字符串，便于受控输入） */
export interface RecordFormInput {
  type: RecordType
  amountYuan: string
  categoryId: string
  date: string
  note: string
}

export interface Category {
  id: string
  name: string
  type: RecordType
}

export interface DaySummary {
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

export interface CategoryBreakdownItem {
  categoryId: string
  name: string
  amountCents: number
  ratio: number
}
