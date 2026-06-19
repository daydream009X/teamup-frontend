<template>
  <div id="teamView">
    <div id="teamPage">
      <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
      <van-tabs v-model:active="active" @change="onTabChange">
        <van-tab title="公开" name="public" />
        <van-tab title="加密" name="private" />
      </van-tabs>
      <div class="add-action">
        <van-button type="primary" block @click="toAddTeam">添加队伍</van-button>
      </div>
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
import { listTeams } from '@/api/team'
import { showToast } from 'vant'
import type { TeamType } from '@/models/team.d.ts'

const active = ref('public')
const router = useRouter()
const searchText = ref('')

/**
 * 切换查询状态
 * @param name
 */
const onTabChange = (name: string) => {
  // 查公开
  if (name === 'public') {
    listTeam(searchText.value, 0)
  } else {
    // 查加密
    listTeam(searchText.value, 2)
  }
}

// 跳转到创建队伍页
const toAddTeam = () => {
  router.push({
    path: '/team/add',
  })
}

const teamList = ref<TeamType[]>([])

/**
 * 搜索队伍
 * @param val
 * @param status
 * @returns {Promise<void>}
 */
const listTeam = async (val = '', status = 0) => {
  const res = await listTeams({
    searchText: val,
    pageNum: 1,
    status,
  })
  if (res?.code === 0) {
    teamList.value = res.data as unknown as TeamType[]
  } else {
    showToast('加载队伍失败，请刷新重试')
  }
}

// 页面加载时只触发一次
onMounted(() => {
  listTeam()
})

const doSearch = () => {
  const status = active.value === 'public' ? 0 : 2
  listTeam(searchText.value, status)
}

const onClear = () => {
  const status = active.value === 'public' ? 0 : 2
  listTeam('', status)
}

const onRefresh = () => {
  const status = active.value === 'public' ? 0 : 2
  listTeam(searchText.value, status)
}
</script>

<style scoped>
#teamView {
}
.add-action {
  padding: 16px;
}
.add-action :deep(.van-button) {
  width: 100%;
  font-size: 18px;
}
</style>
