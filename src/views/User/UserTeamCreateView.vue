<template>
  <div id="userTeamCreateView">
    <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
    <div class="create-action">
      <van-button type="primary" block @click="doJoinTeam">创建队伍</van-button>
    </div>
    <div class="team-list">
      <team-card-list :teamList="teamList" @refresh="onRefresh" />
      <van-empty v-if="teamList?.length < 1" description="数据为空" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TeamCardList from '@/components/TeamCardList.vue'
import TeamSearchBar from '@/components/TeamSearchBar.vue'
import { onMounted, ref } from 'vue'
import { listMyCreateTeams } from '@/api/team'
import type { TeamType } from '@/models/team.d.ts'

const router = useRouter()
const searchText = ref('')

// 跳转到加入队伍页
const doJoinTeam = () => {
  router.push({
    path: '/team/add',
  })
}

const teamList = ref<TeamType[]>([])

/**
 * 搜索队伍
 * @param val
 * @returns {Promise<void>}
 */
const listTeam = async (val = '') => {
  const baseParams = { searchText: val, pageNum: 1 }
  const allTeams = await listMyCreateTeams(baseParams)
  teamList.value = allTeams
}

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
#userTeamCreateView {
}
.create-action {
  padding: 16px;
}
.create-action :deep(.van-button) {
  width: 100%;
  font-size: 18px;
}
.team-list {
  padding-top: 8px;
}
</style>
