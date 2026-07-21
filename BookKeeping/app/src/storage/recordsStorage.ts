import type { LedgerRecord } from '../domain/types'
import { STORAGE_KEY_RECORDS } from './keys'

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

interface StoredPayload {
  version: 1
  records: LedgerRecord[]
}

function isLedgerRecord(value: unknown): value is LedgerRecord {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    (r.type === 'income' || r.type === 'expense') &&
    typeof r.amountCents === 'number' &&
    typeof r.categoryId === 'string' &&
    typeof r.date === 'string' &&
    typeof r.note === 'string' &&
    typeof r.createdAt === 'string' &&
    typeof r.updatedAt === 'string'
  )
}

function isValidPayload(value: unknown): value is StoredPayload {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return p.version === 1 && Array.isArray(p.records) && p.records.every(isLedgerRecord)
}

export type LoadResult = {
  records: LedgerRecord[]
  loadError: string | null
}

export function loadRecords(): LoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS)
    if (!raw) return { records: [], loadError: null }
    const parsed: unknown = JSON.parse(raw)
    if (!isValidPayload(parsed)) {
      return { records: [], loadError: '本地数据无法读取，已从空白开始' }
    }
    return { records: parsed.records, loadError: null }
  } catch {
    return { records: [], loadError: '本地数据无法读取，已从空白开始' }
  }
}

export function saveRecords(records: LedgerRecord[]): void {
  const payload: StoredPayload = { version: 1, records }
  try {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(payload))
  } catch (err) {
    const isQuota =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    throw new StorageError(
      isQuota ? '保存失败，本地存储空间不足' : '保存失败，请稍后重试',
    )
  }
}
