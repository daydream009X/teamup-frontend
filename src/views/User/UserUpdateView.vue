<template>
  <div id="userUpdateView">
    <template v-if="userStore.currentUser">
      <van-cell
        title="昵称"
        is-link
        to="/user/edit"
        :value="userStore.currentUser.username"
        @click="toEdit('username', '昵称', userStore.currentUser.username)"
      />
      <van-cell title="账号" :value="userStore.currentUser.userAccount" />
      <van-cell title="头像" is-link @click="toEdit('avatarUrl', '头像', userStore.currentUser.avatarUrl ?? '')">
        <img style="height: 48px" :src="userStore.currentUser.avatarUrl" />
      </van-cell>
      <van-cell
        title="性别"
        is-link
        :value="userStore.currentUser.gender === 1 ? '男' : userStore.currentUser.gender === 0 ? '女' : '未设置'"
        @click="toEdit('gender', '性别', String(userStore.currentUser.gender))"
      />
      <van-cell
        title="电话"
        is-link
        to="/user/edit"
        :value="userStore.currentUser.phone"
        @click="toEdit('phone', '电话', userStore.currentUser.phone)"
      />
      <van-cell
        title="邮箱"
        is-link
        to="/user/edit"
        :value="userStore.currentUser.email"
        @click="toEdit('email', '邮箱', userStore.currentUser.email)"
      />
      <van-cell title="星球编号" :value="userStore.currentUser.planetCode" />
      <van-cell
        title="标签"
        is-link
        to="/user/edit"
        :value="sortedTags.join('，') || '未设置'"
        @click="toEdit('tags', '标签', JSON.stringify(sortedTags))"
      />
      <van-cell title="注册时间" :value="formatDateTime(userStore.currentUser.createTime)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { formatDateTime } from '@/utils/dateUtils'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const GENDER_TAGS = ['男', '女']

// 标签排序：性别标签在前（根据 user.gender 字段决定，而非 tags 里的旧值）
const sortedTags = computed(() => {
  const user = userStore.currentUser
  if (!user?.tags || !Array.isArray(user.tags)) return []
  // 从 tags 中去掉旧的性别标签，用实际 gender 字段重新生成
  const others = user.tags.filter((t: string) => !GENDER_TAGS.includes(t))
  const genderLabel = user.gender === 1 ? '男' : user.gender === 0 ? '女' : null
  return genderLabel ? [genderLabel, ...others] : [...others]
})

const router = useRouter()

const toEdit = (editKey: string, editName: string, currentValue: string) => {
  router.push({
    path: '/user/edit',
    query: {
      editKey,
      editName,
      currentValue,
    },
  })
}
</script>

<style scoped>
#userUpdateView {
}
</style>
