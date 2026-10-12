import { onScopeDispose, ref } from 'vue'
import type { Ref } from 'vue'
import { showToast } from 'vant'
import { isAxiosError } from 'axios'

import type { TeamType } from '@/models/team.d.ts'

export function useTeamList(fetchTeams: (searchText: string) => Promise<TeamType[]>): {
  teamList: Ref<TeamType[]>
  loading: Ref<boolean>
  errorMessage: Ref<string>
  listTeam: (searchText?: string) => Promise<void>
} {
  const teamList = ref<TeamType[]>([])
  const loading = ref<boolean>(false)
  const errorMessage = ref<string>('')
  let requestId = 0

  const listTeam = async (searchText = '') => {
    const id = ++requestId
    teamList.value = []
    loading.value = true
    errorMessage.value = ''
    try {
      const teams = await fetchTeams(searchText)
      if (id === requestId) teamList.value = teams
    } catch (error) {
      if (id === requestId) {
        errorMessage.value =
          error instanceof Error && !isAxiosError(error)
            ? error.message
            : '加载队伍失败，请检查网络后重试'
        showToast(errorMessage.value)
      }
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  onScopeDispose(() => {
    requestId++
  })
  return { teamList, loading, errorMessage, listTeam }
}
