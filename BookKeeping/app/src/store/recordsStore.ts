import { create } from 'zustand'
import { validateRecordInput } from '../domain/validate'
import type { LedgerRecord, RecordFormInput } from '../domain/types'
import { createId } from '../lib/id'
import { loadRecords, saveRecords, StorageError } from '../storage/recordsStorage'

type FieldErrors = Partial<Record<keyof RecordFormInput, string>>

type MutateResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors }

type RemoveResult = { ok: true } | { ok: false; error: string }

interface RecordsState {
  records: LedgerRecord[]
  hydrated: boolean
  loadError: string | null
  hydrate: () => void
  addRecord: (input: RecordFormInput) => MutateResult
  updateRecord: (id: string, input: RecordFormInput) => MutateResult
  removeRecord: (id: string) => RemoveResult
}

export const useRecordsStore = create<RecordsState>((set, get) => ({
  records: [],
  hydrated: false,
  loadError: null,

  hydrate: () => {
    const { records, loadError } = loadRecords()
    set({ records, loadError, hydrated: true })
  },

  addRecord: (input) => {
    const validated = validateRecordInput(input)
    if (!validated.ok) {
      return { ok: false, error: '请检查表单填写', fieldErrors: validated.fieldErrors }
    }

    const now = new Date().toISOString()
    const id = createId()
    const next: LedgerRecord = {
      ...validated.record,
      id,
      createdAt: now,
      updatedAt: now,
    }
    const prev = get().records
    const records = [...prev, next]
    try {
      saveRecords(records)
      set({ records })
      return { ok: true, id }
    } catch (err) {
      const message = err instanceof StorageError ? err.message : '保存失败，请稍后重试'
      return { ok: false, error: message }
    }
  },

  updateRecord: (id, input) => {
    const validated = validateRecordInput(input)
    if (!validated.ok) {
      return { ok: false, error: '请检查表单填写', fieldErrors: validated.fieldErrors }
    }

    const prev = get().records
    const index = prev.findIndex((r) => r.id === id)
    if (index < 0) {
      return { ok: false, error: '记录不存在' }
    }

    const existing = prev[index]
    const updated: LedgerRecord = {
      ...existing,
      ...validated.record,
      updatedAt: new Date().toISOString(),
    }
    const records = [...prev]
    records[index] = updated
    try {
      saveRecords(records)
      set({ records })
      return { ok: true, id }
    } catch (err) {
      const message = err instanceof StorageError ? err.message : '保存失败，请稍后重试'
      return { ok: false, error: message }
    }
  },

  removeRecord: (id) => {
    const prev = get().records
    const records = prev.filter((r) => r.id !== id)
    if (records.length === prev.length) {
      return { ok: false, error: '记录不存在' }
    }
    try {
      saveRecords(records)
      set({ records })
      return { ok: true }
    } catch (err) {
      const message = err instanceof StorageError ? err.message : '保存失败，请稍后重试'
      return { ok: false, error: message }
    }
  },
}))
