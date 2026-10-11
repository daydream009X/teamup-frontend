import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

// 使用项目已有 TypeScript 编译器，兼容项目支持的 Node 20，无需原生类型擦除。
const cacheDir = fileURLToPath(new URL('../node_modules/.tmp/', import.meta.url))
mkdirSync(cacheDir, { recursive: true })
const tempDir = mkdtempSync(join(cacheDir, 'teamup-history-test-'))
const compiledFile = join(tempDir, 'useSearchHistory.mjs')
let useSearchHistory
try {
  const source = readFileSync(
    new URL('../src/composables/useSearchHistory.ts', import.meta.url),
    'utf8',
  )
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  writeFileSync(compiledFile, outputText)
  ;({ useSearchHistory } = await import(pathToFileURL(compiledFile).href))
} finally {
  unlinkSync(compiledFile)
  rmdirSync(tempDir)
}

const KEY = 'teamup_search_history'

function mockStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
  return storage
}

test('成功搜索记录去空白、去重置顶、限制十条并在重新进入时恢复', () => {
  const storage = mockStorage({ theme: 'dream' })
  const { history, addHistory } = useSearchHistory()
  addHistory('   ')
  assert.deepEqual(history.value, [])
  for (let i = 0; i < 12; i++) addHistory(`标签${i}`)
  assert.equal(history.value.length, 10)
  assert.equal(history.value[0], '标签11')
  assert.equal(history.value.at(-1), '标签2')
  addHistory('  标签5  ')
  assert.equal(history.value[0], '标签5')
  assert.equal(history.value.filter((item) => item === '标签5').length, 1)
  assert.deepEqual(JSON.parse(storage.getItem(KEY)), [...history.value])
  assert.deepEqual(useSearchHistory().history.value, history.value)
  assert.equal(storage.getItem('theme'), 'dream')
})

test('单条删除和一键清空只操作搜索历史键', () => {
  const storage = mockStorage({ [KEY]: JSON.stringify(['前端', '算法']), theme: 'dream' })
  const { history, removeHistory, clearHistory } = useSearchHistory()
  removeHistory('前端')
  assert.deepEqual(history.value, ['算法'])
  assert.deepEqual(JSON.parse(storage.getItem(KEY)), ['算法'])
  clearHistory()
  assert.deepEqual(history.value, [])
  assert.equal(storage.getItem(KEY), null)
  assert.equal(storage.getItem('theme'), 'dream')
})

test('损坏、错误结构及混杂类型的历史可安全恢复', () => {
  for (const raw of ['{broken', 'null', '{}', '123']) {
    mockStorage({ [KEY]: raw })
    const { history, addHistory } = useSearchHistory()
    assert.deepEqual(history.value, [])
    addHistory('数学建模')
    assert.deepEqual(history.value, ['数学建模'])
  }
  mockStorage({ [KEY]: JSON.stringify([' 前端 ', null, '前端', '', 42, '算法']) })
  assert.deepEqual(useSearchHistory().history.value, ['前端', '算法'])
})

test('存储被禁用或配额已满时历史不会抛错', () => {
  const unavailable = () => {
    throw new Error('Storage unavailable')
  }
  Object.defineProperty(globalThis, 'localStorage', { get: unavailable, configurable: true })
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()
  addHistory('蓝桥杯')
  assert.deepEqual(history.value, ['蓝桥杯'])
  removeHistory('蓝桥杯')
  assert.deepEqual(history.value, [])
  clearHistory()
  const storage = mockStorage()
  storage.setItem = unavailable
  const limited = useSearchHistory()
  limited.addHistory('算法')
  assert.deepEqual(limited.history.value, ['算法'])
})
