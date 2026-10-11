<template>
  <div id="teamCardList">
    <van-card
      v-for="team in props.teamList"
      :thumb="teamIllustration"
      :desc="team.description"
      :title="`${team.name}`"
      :key="team.id"
    >
      <template #tags>
        <van-tag plain type="danger" style="margin-right: 8px; margin-top: 8px">
          {{ teamStatusEnum[team.status] }}
        </van-tag>
      </template>
      <template #bottom>
        <div>
          <span>队长：{{ team.createUser?.username ?? '未知' }}</span>
          <span style="margin-left: 1em">{{ `队伍人数: ${team.hasJoinNum}/${team.maxNum}` }}</span>
        </div>
        <div v-if="team.expireTime">
          {{ '过期时间: ' + formatDateTime(team.expireTime) }}
        </div>
        <div>
          {{ '创建时间: ' + formatDateTime(team.createTime) }}
        </div>
      </template>
      <template #footer>
        <van-button
          size="small"
          type="primary"
          v-if="team.userId !== userStore.currentUser?.id && !team.hasJoin"
          plain
          @click="preJoinTeam(team)"
        >
          加入队伍
        </van-button>
        <van-button
          v-if="team.userId === userStore.currentUser?.id"
          size="small"
          plain
          @click="doUpdateTeam(team.id)"
          >更新队伍
        </van-button>
        <!-- 仅加入队伍可见 -->
        <van-button
          v-if="team.userId !== userStore.currentUser?.id && team.hasJoin"
          size="small"
          plain
          type="danger"
          @click="doQuitTeam(team.id)"
          >退出队伍
        </van-button>
        <van-button
          v-if="team.userId === userStore.currentUser?.id"
          size="small"
          type="danger"
          plain
          @click="doDeleteTeam(team.id)"
          >解散队伍
        </van-button>
      </template>
    </van-card>
    <van-dialog
      v-model:show="showPasswordDialog"
      title="请输入密码"
      show-cancel-button
      @confirm="doJoinTeam"
      @cancel="doJoinCancel"
    >
      <van-field v-model="password" placeholder="请输入密码" />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TeamType } from '@/models/team.d.ts'
import { teamStatusEnum } from '@/constants/teamStatus'
import teamIllustration from '@/assets/team.svg'
import { showToast } from 'vant'
import { ref } from 'vue'
import { joinTeam, quitTeam, deleteTeam } from '@/api/team'
import { useRouter } from 'vue-router'
import { formatDateTime } from '@/utils/dateUtils'
import { useUserStore } from '@/stores/user'

interface TeamCardListProps {
  teamList: TeamType[]
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
  teamList: () => [],
})

const emit = defineEmits<{
  refresh: []
}>()

const showPasswordDialog = ref(false)
const password = ref('')
const joinTeamId = ref(0)
const router = useRouter()
const userStore = useUserStore()

const preJoinTeam = (team: TeamType) => {
  joinTeamId.value = team.id
  if (team.status === 0) {
    doJoinTeam()
  } else {
    showPasswordDialog.value = true
  }
}

const doJoinCancel = () => {
  joinTeamId.value = 0
  password.value = ''
}

/**
 * 加入队伍
 */
const doJoinTeam = async () => {
  if (!joinTeamId.value) {
    return
  }
  const res = await joinTeam({
    teamId: joinTeamId.value,
    password: password.value,
  })
  if (res?.code === 0) {
    showToast('加入成功')
    doJoinCancel()
    emit('refresh')
  } else {
    showToast('加入失败' + (res?.description ? `,${res.description}` : ''))
  }
}

/**
 * 跳转至更新队伍页
 * @param id
 */
const doUpdateTeam = (id: number) => {
  router.push({
    path: '/team/update',
    query: {
      id,
    },
  })
}

/**
 * 退出队伍
 * @param id
 */
const doQuitTeam = async (id: number) => {
  const res = await quitTeam(id)
  if (res?.code === 0) {
    showToast('操作成功')
    emit('refresh')
  } else {
    showToast('操作失败' + (res?.description ? `,${res.description}` : ''))
  }
}

/**
 * 解散队伍
 * @param id
 */
const doDeleteTeam = async (id: number) => {
  const res = await deleteTeam(id)
  if (res?.code === 0) {
    showToast('操作成功')
    emit('refresh')
  } else {
    showToast('操作失败' + (res?.description ? `,${res.description}` : ''))
  }
}
</script>

<style scoped>
#teamCardList {
  padding: 0 12px;
}
#teamCardList :deep(.van-card) {
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--card-border);
  margin-bottom: 12px;
  transition: box-shadow 0.3s;
}
#teamCardList :deep(.van-card):hover {
  box-shadow: var(--card-hover-shadow);
}
#teamCardList :deep(.van-image__img) {
  height: 128px;
  object-fit: unset;
}
#teamCardList :deep(.van-tag) {
  color: #87ceeb !important;
  border-color: #87ceeb !important;
  background: transparent !important;
  font-size: 14px;
  font-weight: bold;
}
</style>
