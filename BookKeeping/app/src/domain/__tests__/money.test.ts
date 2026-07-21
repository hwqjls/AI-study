import { describe, expect, it } from 'vitest'
import { formatYuan, yuanToCents } from '../money'

describe('yuanToCents', () => {
  it('converts valid amounts', () => {
    expect(yuanToCents('12.3')).toBe(1230)
    expect(yuanToCents('12.30')).toBe(1230)
    expect(yuanToCents('0.01')).toBe(1)
  })

  it('rejects invalid amounts', () => {
    expect(yuanToCents('0')).toBeNull()
    expect(yuanToCents('')).toBeNull()
    expect(yuanToCents('12.345')).toBeNull()
    expect(yuanToCents('abc')).toBeNull()
  })
})

describe('formatYuan', () => {
  it('formats cents as yuan', () => {
    expect(formatYuan(1230)).toBe('¥12.30')
  })
})
