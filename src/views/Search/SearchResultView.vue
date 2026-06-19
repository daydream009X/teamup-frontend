<template>
  <div id="searchResultView">
    <UserCardList :user-list="userList" :loading="false" />
    <van-empty v-if="!userList || userList.length < 1" description="搜索结果为空" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { searchUsersByTags } from '@/api/user'
import type { UserType } from '@/models/user.d.ts'
import UserCardList from '@/components/UserCardList.vue'

const route = useRoute()
const { tags } = route.query

const userList = ref<UserType[]>([])

onMounted(async () => {
  const userListData = await searchUsersByTags(tags as string | string[])
    .then(function (response) {
      console.log('/user/search/tags succeed', response)
      return response?.data
    })
    .catch(function (error) {
      console.error('/user/search/tags error', error)
      showToast('请求失败')
    })
  console.log(userListData)
  if (userListData && Array.isArray(userListData)) {
    userListData.forEach((user) => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags as string)
      }
    })
    userList.value = userListData as UserType[]
  }
})
</script>

<style scoped>
#searchResultView {
}
</style>
