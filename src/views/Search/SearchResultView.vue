<template>
  <div id="searchResultView">
    <UserCardList :user-list="userList" />
    <van-empty v-if="!userList || userList.length < 1" description="搜索结果为空" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import myAxios from '@/plugins/myAxios'
import qs from 'qs'
import UserCardList from '@/components/UserCardList.vue'

const route = useRoute()
const { tags } = route.query

const userList = ref([])

onMounted(async () => {
  const userListData = await myAxios
    .get('/user/search/tags', {
      params: {
        tagNameList: tags,
      },
      paramsSerializer: (params: Record<string, unknown>) => {
        return qs.stringify(params, { indices: false })
      },
    })
    .then(function (response) {
      console.log('/user/search/tags succeed', response)
      return response?.data
    })
    .catch(function (error) {
      console.error('/user/search/tags error', error)
      showToast('请求失败')
    })
  console.log(userListData)
  if (userListData) {
    userListData.forEach((user: any) => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags)
      }
    })
    userList.value = userListData
  }
})
</script>

<style scoped>
#searchResultView {
}
</style>
