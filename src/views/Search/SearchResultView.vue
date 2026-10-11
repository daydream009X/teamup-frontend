<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

import UserCardList from '@/components/UserCardList.vue'
import { useSearchHistory } from '@/composables/useSearchHistory'
import { searchUsersByTags } from '@/api/user'
import type { UserType } from '@/models/user.d.ts'

const route = useRoute()
const { addHistory } = useSearchHistory()
const userList = ref<UserType[]>([])
const loading = ref<boolean>(false)
const emptyMessage = ref<string>('暂未找到符合标签的队友，试试其他技能标签')

const normalizeTags = (raw: unknown): string[] => {
  let tags = raw
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags)
    } catch {
      return []
    }
  }
  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : []
}

watch(
  () => route.query.tags,
  async (rawTags, _previous, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    const values = Array.isArray(rawTags) ? rawTags : [rawTags]
    const tags = [
      ...new Set(
        values
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ]
    userList.value = []
    loading.value = false
    if (!tags.length) {
      emptyMessage.value = '请先返回搜索页，输入或选择竞赛技能标签'
      return
    }
    loading.value = true
    try {
      const response = await searchUsersByTags(tags)
      if (!active) return
      if (response.code !== 0 || !Array.isArray(response.data)) {
        emptyMessage.value = '搜索未成功，请稍后重试'
        showToast(response.description || response.message || emptyMessage.value)
        return
      }
      userList.value = response.data.map((user: UserType) => ({
        ...user,
        tags: normalizeTags(user.tags),
      }))
      emptyMessage.value = '暂未找到符合标签的队友，试试其他技能标签'
      // 空结果也属于成功；多选查询按标签分别记录。
      tags.slice().reverse().forEach(addHistory)
    } catch {
      if (active) {
        emptyMessage.value = '搜索请求失败，请检查网络后重试'
        showToast(emptyMessage.value)
      }
    } finally {
      if (active) loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="searchResultView" :aria-busy="loading">
    <van-skeleton v-if="loading" title avatar :row="3" class="search-loading" />
    <UserCardList v-else :user-list="userList" :loading="false" />
    <van-empty v-if="!loading && !userList.length" :description="emptyMessage" />
  </div>
</template>

<style scoped>
.search-loading {
  padding: 16px;
}
</style>
