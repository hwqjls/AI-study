import { getCategoryById } from './categories'
import type {
  CategoryBreakdownItem,
  DaySummary,
  LedgerRecord,
  RecordType,
} from './types'

export function filterByDate(records: LedgerRecord[], date: string): LedgerRecord[] {
  return records.filter((r) => r.date === date)
}

export function filterByMonth(records: LedgerRecord[], yearMonth: string): LedgerRecord[] {
  return records.filter((r) => r.date.startsWith(yearMonth))
}

export function summarize(records: LedgerRecord[]): DaySummary {
  let incomeCents = 0
  let expenseCents = 0
  for (const r of records) {
    if (r.type === 'income') incomeCents += r.amountCents
    else expenseCents += r.amountCents
  }
  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  }
}

export function breakdownByCategory(
  records: LedgerRecord[],
  type: RecordType,
): CategoryBreakdownItem[] {
  const filtered = records.filter((r) => r.type === type)
  const totals = new Map<string, number>()
  let sum = 0
  for (const r of filtered) {
    const next = (totals.get(r.categoryId) ?? 0) + r.amountCents
    totals.set(r.categoryId, next)
    sum += r.amountCents
  }

  const items: CategoryBreakdownItem[] = []
  for (const [categoryId, amountCents] of totals) {
    const cat = getCategoryById(categoryId)
    items.push({
      categoryId,
      name: cat?.name ?? categoryId,
      amountCents,
      ratio: sum > 0 ? amountCents / sum : 0,
    })
  }
  return items.sort((a, b) => b.amountCents - a.amountCents)
}

export function sortRecordsDesc(records: LedgerRecord[]): LedgerRecord[] {
  return [...records].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.createdAt < b.createdAt ? 1 : -1
  })
}
