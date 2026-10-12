<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

import TagSelector from '@/components/TagSelector.vue'
import { useSearchHistory } from '@/composables/useSearchHistory'
import HOT_TAGS from '@/constants/hotTags'

const router = useRouter()
const tagSelectorRef = ref<InstanceType<typeof TagSelector>>()
const searchText = ref<string>('')
const activeIds = ref<string[]>([])
const searchFocused = ref<boolean>(false)
const pointerActive = ref(false)
let pointerReleaseTimer: number | undefined
const composing = ref(false)
const { history, removeHistory, clearHistory } = useSearchHistory()

const showDiscovery = computed(
  () => searchFocused.value || pointerActive.value || !searchText.value.trim(),
)

// 按下时失焦不能立即移除热词，或让下方待点击的标签改变位置。
const handlePointerStart = (): void => {
  pointerActive.value = showDiscovery.value
}
const handlePointerEnd = (): void => {
  window.clearTimeout(pointerReleaseTimer)
  pointerReleaseTimer = window.setTimeout(() => {
    pointerActive.value = false
  }, 0)
}
onMounted(() => {
  window.addEventListener('pointerup', handlePointerEnd)
  window.addEventListener('pointercancel', handlePointerEnd)
})
onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerEnd)
  window.removeEventListener('pointercancel', handlePointerEnd)
  window.clearTimeout(pointerReleaseTimer)
})

const handleEnter = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && (composing.value || event.isComposing)) event.stopPropagation()
}

const handleFocusOut = (event: FocusEvent): void => {
  const container = event.currentTarget as HTMLElement
  searchFocused.value =
    event.relatedTarget instanceof Node && container.contains(event.relatedTarget)
}

const handleFilter = (value: string): void => {
  tagSelectorRef.value?.filter(value.trim())
}

const handleCancel = (): void => {
  searchText.value = ''
  handleFilter('')
}

const handleSearch = async (tags: string[]): Promise<void> => {
  const keywords = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))]
  if (!keywords.length) {
    showToast('请输入或选择竞赛技能标签')
    return
  }
  try {
    await router.push({ path: '/user/list', query: { tags: keywords } })
  } catch {
    showToast('暂时无法打开搜索结果，请重试')
  }
}

const handleKeywordSearch = (keyword: string): Promise<void> => {
  const value = keyword.trim()
  if (!value) return handleSearch([])
  searchText.value = value
  activeIds.value = [value]
  return handleSearch(activeIds.value)
}

const handleSelectedSearch = (): Promise<void> => handleSearch(activeIds.value)
</script>

<template>
  <div id="searchView" @pointerdown="handlePointerStart">
    <div @focusin="searchFocused = true" @focusout="handleFocusOut">
      <form
        @submit.prevent
        @compositionstart.capture="composing = true"
        @compositionend.capture="composing = false"
        @keydown.capture="handleEnter"
        @keypress.capture="handleEnter"
      >
        <van-search
          v-model="searchText"
          show-action
          placeholder="搜索数学建模、算法、前端等技能标签"
          @update:model-value="handleFilter"
          @search="handleKeywordSearch"
          @cancel="handleCancel"
        />
      </form>
      <div v-if="showDiscovery" class="search-discovery">
        <section aria-labelledby="history-heading" class="discovery-section">
          <div class="section-heading">
            <h2 id="history-heading">搜索历史</h2>
            <van-button v-if="history.length" size="mini" plain type="danger" @click="clearHistory">
              清空历史
            </van-button>
          </div>
          <div v-if="history.length" class="tag-cloud">
            <span v-for="keyword in history" :key="keyword" class="history-item">
              <button class="tag-button" type="button" @click="handleKeywordSearch(keyword)">
                <van-tag plain type="primary">{{ keyword }}</van-tag>
              </button>
              <button
                class="delete-button"
                type="button"
                :aria-label="`删除搜索历史：${keyword}`"
                @click.stop="removeHistory(keyword)"
              >
                <van-icon name="cross" />
              </button>
            </span>
          </div>
          <p v-else class="section-hint">暂无搜索历史，搜索成功后会自动记录</p>
        </section>
        <section aria-labelledby="hot-tags-heading" class="discovery-section">
          <div class="section-heading">
            <h2 id="hot-tags-heading">热门标签</h2>
            <span class="section-hint">竞赛与技能推荐</span>
          </div>
          <div class="tag-cloud">
            <button
              v-for="tag in HOT_TAGS"
              :key="tag"
              class="tag-button"
              type="button"
              @click="handleKeywordSearch(tag)"
            >
              <van-tag plain type="primary">{{ tag }}</van-tag>
            </button>
          </div>
        </section>
      </div>
    </div>
    <p class="search-help">输入完整标签可直接搜索，也可在下方多选技能寻找队友</p>
    <TagSelector ref="tagSelectorRef" v-model="activeIds" />
    <div class="search-action">
      <van-button block type="primary" @click="handleSelectedSearch">按已选标签搜索</van-button>
    </div>
  </div>
</template>

<style scoped>
.search-discovery {
  margin: 12px;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
}
.discovery-section + .discovery-section {
  margin-top: 20px;
}
.section-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.section-heading h2 {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
}
.section-hint,
.search-help {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}
.search-help {
  padding: 0 16px;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.history-item {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-width: 0;
}
.tag-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  max-width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.tag-button :deep(.van-tag) {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 4px;
  color: var(--color-primary);
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: left;
  line-height: 1.5;
}
.delete-button {
  flex-shrink: 0;
  width: 32px;
  color: var(--text-muted);
}
.search-action {
  padding: 12px;
}
</style>
