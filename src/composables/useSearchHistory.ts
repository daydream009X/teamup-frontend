import { readonly, ref } from 'vue'
import type { Ref } from 'vue'

const STORAGE_KEY = 'teamup_search_history'
const HISTORY_LIMIT = 10

export interface UseSearchHistoryReturn {
  history: Readonly<Ref<readonly string[]>>
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

const readHistory = (): string[] => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []
    return [
      ...new Set(
        stored
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ].slice(0, HISTORY_LIMIT)
  } catch {
    // 损坏的历史或不可用的存储不应阻断搜索。
    return []
  }
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const history = ref<string[]>(readHistory())

  const saveHistory = (items: string[]): void => {
    history.value = items
    try {
      if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 存储被禁用或已满时，仍保留当前页面内的记录。
      return
    }
  }

  const addHistory = (keyword: string): void => {
    const value = keyword.trim()
    if (!value) return
    saveHistory([value, ...history.value.filter((item) => item !== value)].slice(0, HISTORY_LIMIT))
  }

  const removeHistory = (keyword: string): void => {
    saveHistory(history.value.filter((item) => item !== keyword))
  }
  const clearHistory = (): void => saveHistory([])

  return { history: readonly(history), addHistory, removeHistory, clearHistory }
}
