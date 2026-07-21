/** 本地时区今天，YYYY-MM-DD（避免 toISOString UTC 偏移） */
export function today(): string {
  return formatLocalDate(new Date())
}

export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return formatLocalDate(dt)
}

export function toYearMonth(date: string): string {
  return date.slice(0, 7)
}

export function addMonths(yearMonth: string, n: number): string {
  const [y, m] = yearMonth.split('-').map(Number)
  const dt = new Date(y, m - 1 + n, 1)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  return `${yy}-${mm}`
}

export function isCurrentMonth(yearMonth: string): boolean {
  return yearMonth === toYearMonth(today())
}

export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}
