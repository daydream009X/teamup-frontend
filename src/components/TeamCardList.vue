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
          :loading="pendingTeamId === team.id"
          :disabled="pendingTeamId !== null"
          @click="preJoinTeam(team)"
        >
          加入队伍
        </van-button>
        <van-button
          v-if="team.userId === userStore.currentUser?.id"
          size="small"
          plain
          :disabled="pendingTeamId !== null"
          @click="doUpdateTeam(team.id)"
          >更新队伍
        </van-button>
        <!-- 仅加入队伍可见 -->
        <van-button
          v-if="team.userId !== userStore.currentUser?.id && team.hasJoin"
          size="small"
          plain
          type="danger"
          :loading="pendingTeamId === team.id"
          :disabled="pendingTeamId !== null"
          @click="doQuitTeam(team.id)"
          >退出队伍
        </van-button>
        <van-button
          v-if="team.userId === userStore.currentUser?.id"
          size="small"
          type="danger"
          plain
          :loading="pendingTeamId === team.id"
          :disabled="pendingTeamId !== null"
          @click="doDeleteTeam(team.id)"
          >解散队伍
        </van-button>
      </template>
    </van-card>
    <van-dialog
      v-model:show="showPasswordDialog"
      title="请输入密码"
      show-cancel-button
      :before-close="onPasswordDialogClose"
      :confirm-button-disabled="pendingTeamId !== null"
      :cancel-button-disabled="pendingTeamId !== null"
    >
      <van-field v-model="password" placeholder="请输入密码" :disabled="pendingTeamId !== null" />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import type { TeamType } from '@/models/team.d.ts'
import { teamStatusEnum } from '@/constants/teamStatus'
import teamIllustration from '@/assets/team.svg'
import { showToast } from 'vant'
import { onUnmounted, ref } from 'vue'
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
const pendingTeamId = ref<number | null>(null)
let active = true
const router = useRouter()
const userStore = useUserStore()

const preJoinTeam = (team: TeamType) => {
  if (!active || pendingTeamId.value !== null) return
  joinTeamId.value = team.id
  password.value = ''
  if (team.status === 0) {
    void doJoinTeam()
  } else {
    showPasswordDialog.value = true
  }
}

const doJoinCancel = () => {
  joinTeamId.value = 0
  password.value = ''
}

const runTeamAction = async (
  teamId: number,
  request: () => ReturnType<typeof joinTeam>,
  successMessage: string,
  failureMessage: string,
  onSuccess?: () => void,
): Promise<boolean> => {
  if (!active || pendingTeamId.value !== null) return false
  pendingTeamId.value = teamId
  try {
    const res = await request()
    if (!active) return false
    if (res?.code === 0) {
      onSuccess?.()
      showToast(successMessage)
      emit('refresh')
      return true
    }
    showToast(failureMessage + (res?.description ? `，${res.description}` : ''))
    return false
  } catch {
    if (active) showToast(`${failureMessage}，请检查网络后重试`)
    return false
  } finally {
    if (active) pendingTeamId.value = null
  }
}

/**
 * 加入队伍
 */
const doJoinTeam = (): Promise<boolean> => {
  const teamId = joinTeamId.value
  const teamPassword = password.value
  if (!teamId) return Promise.resolve(false)
  return runTeamAction(
    teamId,
    () => joinTeam({ teamId, password: teamPassword }),
    '加入成功',
    '加入失败',
    doJoinCancel,
  )
}

const onPasswordDialogClose = async (action: string): Promise<boolean> => {
  if (!active || pendingTeamId.value !== null) return false
  if (action === 'confirm') return doJoinTeam()
  doJoinCancel()
  return true
}

/**
 * 跳转至更新队伍页
 * @param id
 */
const doUpdateTeam = (id: number) => {
  if (!active || pendingTeamId.value !== null) return
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
const doQuitTeam = (id: number): Promise<boolean> =>
  runTeamAction(id, () => quitTeam(id), '退出成功', '退出失败')

/**
 * 解散队伍
 * @param id
 */
const doDeleteTeam = (id: number): Promise<boolean> =>
  runTeamAction(id, () => deleteTeam(id), '解散成功', '解散失败')

onUnmounted(() => {
  active = false
})
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
