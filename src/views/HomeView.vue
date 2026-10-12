<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { showToast } from 'vant'

import UserCardList from '@/components/UserCardList.vue'
import { matchUsers, recommendUsers } from '@/api/user'
import type { UserType } from '@/models/user.d.ts'
import { useUserStore } from '@/stores/user'

const isMatchMode = ref<boolean>(false)

const userList = ref<UserType[]>([])
const loading = ref<boolean>(true)
const errorMessage = ref<string>('')
const retryCount = ref<number>(0)
const userStore = useUserStore()
const visibleUsers = computed(() =>
  userList.value.filter((user) => user.id !== userStore.currentUser?.id),
)

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
  [isMatchMode, retryCount],
  async ([matchMode], _previous, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    userList.value = []
    errorMessage.value = ''
    loading.value = true
    try {
      const response = matchMode ? await matchUsers(10) : await recommendUsers(8, 1)
      if (!active) return
      const data = matchMode
        ? response.data
        : (response.data as { records?: unknown } | null)?.records
      if (response.code !== 0 || !Array.isArray(data)) {
        errorMessage.value = response.description || response.message || '获取队友失败，请稍后重试'
        showToast(errorMessage.value)
        return
      }
      userList.value = data.map((user: UserType) => ({ ...user, tags: normalizeTags(user.tags) }))
    } catch {
      if (active) {
        errorMessage.value = '获取队友失败，请检查网络后重试'
        showToast(errorMessage.value)
      }
    } finally {
      if (active) loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div id="homeView" :aria-busy="loading">
    <van-cell center title="标签相似匹配" label="按已有标签寻找相似队友">
      <template #right-icon>
        <van-switch v-model="isMatchMode" size="24" />
      </template>
    </van-cell>
    <van-skeleton v-if="loading" title avatar :row="3" class="home-loading" />
    <UserCardList v-else :user-list="visibleUsers" :loading="false" />
    <van-empty
      v-if="!loading && !visibleUsers.length"
      :description="errorMessage || '暂未找到队友，试试按竞赛或技能标签搜索'"
    >
      <van-button v-if="errorMessage" type="primary" size="small" @click="retryCount++">
        重试
      </van-button>
    </van-empty>
  </div>
</template>

<style scoped>
.home-loading {
  padding: 16px;
}
</style>
