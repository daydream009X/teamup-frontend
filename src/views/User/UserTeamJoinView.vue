<template>
  <div id="userTeamJoinView" :aria-busy="loading">
    <team-search-bar v-model="searchText" @search="doSearch" @clear="onClear" />
    <van-skeleton v-if="loading" title :row="3" class="team-loading" />
    <team-card-list v-else :teamList="teamList" @refresh="onRefresh" />
    <van-empty v-if="!loading && !teamList.length" :description="errorMessage || '数据为空'">
      <van-button v-if="errorMessage" type="primary" size="small" @click="onRefresh">
        重试
      </van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
import TeamCardList from '@/components/TeamCardList.vue'
import TeamSearchBar from '@/components/TeamSearchBar.vue'
import { onMounted, ref } from 'vue'
import { listMyJoinTeams } from '@/api/team'
import { useTeamList } from '@/composables/useTeamList'

const searchText = ref('')

const { teamList, loading, errorMessage, listTeam } = useTeamList((val) =>
  listMyJoinTeams({ searchText: val, pageNum: 1 }),
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
#userTeamJoinView {
}
.team-loading {
  padding: 16px;
}
</style>
