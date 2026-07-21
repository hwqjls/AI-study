import type { Category, RecordType } from './types'

export const CATEGORIES: Category[] = [
  { id: 'exp-food', name: '餐饮', type: 'expense' },
  { id: 'exp-transport', name: '交通', type: 'expense' },
  { id: 'exp-shopping', name: '购物', type: 'expense' },
  { id: 'exp-housing', name: '居住', type: 'expense' },
  { id: 'exp-entertainment', name: '娱乐', type: 'expense' },
  { id: 'exp-medical', name: '医疗', type: 'expense' },
  { id: 'exp-education', name: '教育', type: 'expense' },
  { id: 'exp-other', name: '其他', type: 'expense' },
  { id: 'inc-salary', name: '工资', type: 'income' },
  { id: 'inc-parttime', name: '兼职', type: 'income' },
  { id: 'inc-gift', name: '红包', type: 'income' },
  { id: 'inc-invest', name: '投资', type: 'income' },
  { id: 'inc-other', name: '其他', type: 'income' },
]

export function categoriesForType(type: RecordType): Category[] {
  return CATEGORIES.filter((c) => c.type === type)
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
