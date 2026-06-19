<template>
  <div id="userUpdateView">
    <template v-if="user">
      <van-cell
        title="昵称"
        is-link
        to="/user/edit"
        :value="user.username"
        @click="toEdit('username', '昵称', user.username)"
      />
      <van-cell title="账号" :value="user.userAccount" />
      <van-cell title="头像" is-link @click="toEdit('avatarUrl', '头像', user.avatarUrl)">
        <img style="height: 48px" :src="user.avatarUrl" />
      </van-cell>
      <van-cell
        title="性别"
        is-link
        :value="user.gender === 1 ? '男' : user.gender === 0 ? '女' : '未设置'"
        @click="toEdit('gender', '性别', String(user.gender))"
      />
      <van-cell
        title="电话"
        is-link
        to="/user/edit"
        :value="user.phone"
        @click="toEdit('phone', '电话', user.phone)"
      />
      <van-cell
        title="邮箱"
        is-link
        to="/user/edit"
        :value="user.email"
        @click="toEdit('email', '邮箱', user.email)"
      />
      <van-cell title="星球编号" :value="user.planetCode" />
      <van-cell
        title="标签"
        is-link
        to="/user/edit"
        :value="sortedTags.join('，') || '未设置'"
        @click="toEdit('tags', '标签', JSON.stringify(sortedTags))"
      />
      <van-cell title="注册时间" :value="formatDateTime(user.createTime)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { getCurrentUser } from '@/api/user'
import { formatDateTime } from '@/utils/dateUtils'

const user = ref()
const GENDER_TAGS = ['男', '女']

// 标签排序：性别标签在前（根据 user.gender 字段决定，而非 tags 里的旧值）
const sortedTags = computed(() => {
  if (!user.value?.tags || !Array.isArray(user.value.tags)) return []
  // 从 tags 中去掉旧的性别标签，用实际 gender 字段重新生成
  const others = user.value.tags.filter((t: string) => !GENDER_TAGS.includes(t))
  const genderLabel = user.value.gender === 1 ? '男' : user.value.gender === 0 ? '女' : null
  return genderLabel ? [genderLabel, ...others] : [...others]
})

onMounted(async () => {
  user.value = await getCurrentUser()
  if (user.value?.tags && typeof user.value.tags === 'string') {
    user.value.tags = JSON.parse(user.value.tags)
  }
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
