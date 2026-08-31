<template>
  <div id="homeView">
    <van-cell center title="极速匹配">
      <template #right-icon>
        <van-switch v-model="isMatchMode" size="24" />
      </template>
    </van-cell>
    <user-card-list :user-list="userList" :loading="loading" />
    <van-empty v-if="!userList || userList.length < 1" description="数据为空" />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { showToast } from 'vant'
import UserCardList from '@/components/UserCardList.vue'
import { matchUsers, recommendUsers } from '@/api/user'
import type { UserType } from '@/models/user.d.ts'
import { useUserStore } from '@/stores/user'

const isMatchMode = ref<boolean>(false)

const userList = ref<UserType[]>([])
const loading = ref(true)
const userStore = useUserStore()

/**
 * 加载数据
 */
const loadData = async () => {
  let userListData: Record<string, unknown>[] | undefined
  loading.value = true
  // 极速匹配模式，根据标签匹配用户
  if (isMatchMode.value) {
    const num = 10
    try {
      const res = await matchUsers(num)
      console.log('/user/match succeed', res)
      userListData = res?.data as unknown as Record<string, unknown>[]
    } catch (error) {
      console.error('/user/match error', error)
      showToast('请求失败')
    }
  } else {
    // 普通模式，直接分页查询用户
    try {
      const res = await recommendUsers(8, 1)
      console.log('/user/recommend succeed', res)
      userListData = (res?.data as Record<string, unknown>)?.records as unknown as Record<
        string,
        unknown
      >[]
    } catch (error) {
      console.error('/user/recommend error', error)
      showToast('请求失败')
    }
  }
  if (userListData) {
    userListData.forEach((user: Record<string, unknown>) => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags as string)
      }
    })
    userList.value = userListData as UserType[]
    if (userStore.currentUser) {
      userList.value = userList.value.filter((u) => u.id !== userStore.currentUser?.id)
    }
  }
  loading.value = false
}

watchEffect(() => {
  loadData()
})
</script>

<style scoped>
#homeView {
}
</style>
