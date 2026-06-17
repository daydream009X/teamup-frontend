<template>
  <div id="userTeamJoinView">
    <van-search v-model="searchText" placeholder="搜索队伍" @search="onSearch" />
    <team-card-list :teamList="teamList" />
    <van-empty v-if="teamList?.length < 1" description="数据为空" />
  </div>
</template>

<script setup lang="ts">
// import { useRouter } from 'vue-router'
import TeamCardList from '@/components/TeamCardList.vue'
import { onMounted, ref } from 'vue'
import myAxios from '@/plugins/myAxios'
// import { showToast } from 'vant'
import type { TeamType } from '@/models/team.d.ts'

// const router = useRouter()
const searchText = ref('')

const teamList = ref<TeamType[]>([])

/**
 * 搜索队伍
 * @param val
 * @returns {Promise<void>}
 */
const listTeam = async (val = '') => {
  const baseParams = { searchText: val, pageNum: 1 }
  const results = await Promise.all([
    myAxios.get('/team/list/my/join', { params: { ...baseParams, status: 0 } }),
    myAxios.get('/team/list/my/join', { params: { ...baseParams, status: 1 } }),
    myAxios.get('/team/list/my/join', { params: { ...baseParams, status: 2 } }),
  ])
  const allTeams = results
    .filter((res) => res?.code === 0)
    .flatMap((res) => (res.data as unknown as TeamType[]) || [])
  teamList.value = allTeams
}

// 页面加载时只触发一次
onMounted(() => {
  listTeam()
})

const onSearch = (val: string) => {
  listTeam(val)
}
</script>

<style scoped>
#userTeamJoinView {
}
</style>
