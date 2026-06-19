<template>
  <div id="userTeamJoinView">
    <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
    <team-card-list :teamList="teamList" @refresh="onRefresh" />
    <van-empty v-if="teamList?.length < 1" description="数据为空" />
  </div>
</template>

<script setup lang="ts">
import TeamCardList from '@/components/TeamCardList.vue'
import TeamSearchBar from '@/components/TeamSearchBar.vue'
import { onMounted, ref } from 'vue'
import { listMyJoinTeams } from '@/api/team'
import type { TeamType } from '@/models/team.d.ts'

const searchText = ref('')

const teamList = ref<TeamType[]>([])

/**
 * 搜索队伍
 * @param val
 * @returns {Promise<void>}
 */
const listTeam = async (val = '') => {
  const baseParams = { searchText: val, pageNum: 1 }
  const allTeams = await listMyJoinTeams(baseParams)
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
#userTeamJoinView {
}
</style>
