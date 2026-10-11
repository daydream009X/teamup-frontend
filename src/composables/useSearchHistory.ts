import { getCurrentScope, onScopeDispose, readonly, ref } from 'vue'
import type { Ref } from 'vue'

const STORAGE_KEY = 'teamup_search_history'
const HISTORY_LIMIT = 10

export interface UseSearchHistoryReturn {
  history: Readonly<Ref<readonly string[]>>
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

const readHistory = (): string[] | null => {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  try {
    const stored: unknown = JSON.parse(raw ?? '[]')
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
    // 损坏的历史不应阻断搜索，下次写入时可覆盖恢复。
    return []
  }
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const stored = readHistory()
  const history = ref<string[]>(stored ?? [])
  let memoryOnly = stored === null

  const latestHistory = (): string[] =>
    memoryOnly ? history.value : (readHistory() ?? history.value)

  const saveHistory = (items: string[]): void => {
    history.value = items
    try {
      if (items.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      else localStorage.removeItem(STORAGE_KEY)
      memoryOnly = false
    } catch {
      // 存储被禁用或已满时，仍保留当前页面内的记录。
      memoryOnly = true
    }
  }

  const addHistory = (keyword: string): void => {
    const value = keyword.trim()
    if (!value) return
    saveHistory(
      [value, ...latestHistory().filter((item) => item !== value)].slice(0, HISTORY_LIMIT),
    )
  }

  const removeHistory = (keyword: string): void => {
    saveHistory(latestHistory().filter((item) => item !== keyword))
  }
  const clearHistory = (): void => saveHistory([])

  if (typeof window !== 'undefined' && getCurrentScope()) {
    const syncHistory = (event: StorageEvent): void => {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      try {
        if (event.storageArea !== localStorage) return
      } catch {
        return
      }
      const latest = readHistory()
      if (latest !== null) {
        history.value = latest
        memoryOnly = false
      }
    }
    window.addEventListener('storage', syncHistory)
    onScopeDispose(() => window.removeEventListener('storage', syncHistory))
  }

  return { history: readonly(history), addHistory, removeHistory, clearHistory }
}
