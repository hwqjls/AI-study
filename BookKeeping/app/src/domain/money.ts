const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

/** 元字符串 → 分；非法返回 null */
export function yuanToCents(yuan: string): number | null {
  const trimmed = yuan.trim()
  if (!AMOUNT_PATTERN.test(trimmed)) return null
  const [intPart, fracPart = ''] = trimmed.split('.')
  const cents = Number(intPart) * 100 + Number(fracPart.padEnd(2, '0').slice(0, 2))
  if (!Number.isFinite(cents) || cents <= 0) return null
  return cents
}

export function centsToYuanNumber(cents: number): number {
  return cents / 100
}

export function formatYuan(cents: number): string {
  return `¥${centsToYuanNumber(cents).toFixed(2)}`
}
