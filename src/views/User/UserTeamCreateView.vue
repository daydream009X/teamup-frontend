<template>
  <div id="userTeamCreateView" :aria-busy="loading">
    <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
    <div class="create-action">
      <van-button type="primary" block @click="doJoinTeam">创建队伍</van-button>
    </div>
    <div class="team-list">
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
import { listMyCreateTeams } from '@/api/team'
import { useTeamList } from '@/composables/useTeamList'

const router = useRouter()
const searchText = ref('')

// 跳转到加入队伍页
const doJoinTeam = () => {
  router.push({
    path: '/team/add',
  })
}

const { teamList, loading, errorMessage, listTeam } = useTeamList((val) =>
  listMyCreateTeams({ searchText: val, pageNum: 1 }),
)

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
.team-loading {
  padding: 16px;
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
