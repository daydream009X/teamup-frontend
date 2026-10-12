<template>
  <div id="teamView" :aria-busy="loading">
    <div id="teamPage">
      <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
      <van-tabs v-model:active="active" @change="onTabChange">
        <van-tab title="公开" name="public" />
        <van-tab title="加密" name="private" />
      </van-tabs>
      <div class="add-action">
        <van-button type="primary" block @click="toAddTeam">添加队伍</van-button>
      </div>
      <van-skeleton v-if="loading" title :row="3" class="team-loading" />
      <team-card-list v-else :teamList="teamList" @refresh="onRefresh" />
      <van-empty v-if="!loading && !teamList.length" :description="errorMessage || '数据为空'">
        <van-button v-if="errorMessage" type="primary" size="small" @click="onRefresh">
          重试
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TeamCardList from '@/components/TeamCardList.vue'
import TeamSearchBar from '@/components/TeamSearchBar.vue'
import { onMounted, ref } from 'vue'
import { listTeams } from '@/api/team'
import { useTeamList } from '@/composables/useTeamList'

const active = ref('public')
const router = useRouter()
const searchText = ref('')

/**
 * 切换查询状态
 * @param name
 */
const onTabChange = () => {
  listTeam(searchText.value)
}

// 跳转到创建队伍页
const toAddTeam = () => {
  router.push({
    path: '/team/add',
  })
}

const { teamList, loading, errorMessage, listTeam } = useTeamList(async (val) => {
  const res = await listTeams({
    searchText: val,
    pageNum: 1,
    status: active.value === 'public' ? 0 : 2,
  })
  if (res.code !== 0 || !Array.isArray(res.data)) {
    throw new Error(res.description || res.message || '加载队伍失败，请稍后重试')
  }
  return res.data
})

// 页面加载时只触发一次
onMounted(() => {
  listTeam()
})

const doSearch = () => {
  listTeam(searchText.value)
}

const onClear = () => {
  listTeam('')
}

const onRefresh = () => {
  listTeam(searchText.value)
}
</script>

<style scoped>
#teamView {
}
.team-loading {
  padding: 16px;
}
.add-action {
  padding: 16px;
}
.add-action :deep(.van-button) {
  width: 100%;
  font-size: 18px;
}
</style>
