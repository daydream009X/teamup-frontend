import myAxios from '@/plugins/myAxios'
import type { TeamType } from '@/models/team.d.ts'

/**
 * 获取队伍列表
 */
export const listTeams = (params: { searchText?: string; pageNum?: number; status?: number }) =>
  myAxios.get<TeamType[]>('/team/list', { params })

/**
 * 创建队伍
 */
export const addTeam = (data: Record<string, unknown>) =>
  myAxios.post('/team/add', data)

/**
 * 获取队伍详情
 */
export const getTeam = (id: number | string) =>
  myAxios.get('/team/get', { params: { id } })

/**
 * 更新队伍
 */
export const updateTeam = (data: Record<string, unknown>) =>
  myAxios.post('/team/update', data)

/**
 * 加入队伍
 */
export const joinTeam = (data: { teamId: number; password?: string }) =>
  myAxios.post('/team/join', data)

/**
 * 退出队伍
 */
export const quitTeam = (teamId: number) =>
  myAxios.post('/team/quit', { teamId })

/**
 * 解散队伍
 */
export const deleteTeam = (id: number) =>
  myAxios.post('/team/delete', { id })

/**
 * 我加入的队伍（按状态分别查询后合并）
 */
export const listMyJoinTeams = async (params: { searchText?: string; pageNum?: number }) => {
  const baseParams = { ...params }
  const results = await Promise.all([
    myAxios.get<TeamType[]>('/team/list/my/join', { params: { ...baseParams, status: 0 } }),
    myAxios.get<TeamType[]>('/team/list/my/join', { params: { ...baseParams, status: 1 } }),
    myAxios.get<TeamType[]>('/team/list/my/join', { params: { ...baseParams, status: 2 } }),
  ])
  const allTeams = results
    .filter((res) => res?.code === 0)
    .flatMap((res) =>
      ((res.data as unknown as TeamType[]) || []).map((t) => ({ ...t, hasJoin: true })),
    )
  return allTeams
}

/**
 * 我创建的队伍（按状态分别查询后合并）
 */
export const listMyCreateTeams = async (params: { searchText?: string; pageNum?: number }) => {
  const baseParams = { ...params }
  const results = await Promise.all([
    myAxios.get<TeamType[]>('/team/list/my/create', { params: { ...baseParams, status: 0 } }),
    myAxios.get<TeamType[]>('/team/list/my/create', { params: { ...baseParams, status: 1 } }),
    myAxios.get<TeamType[]>('/team/list/my/create', { params: { ...baseParams, status: 2 } }),
  ])
  const allTeams = results
    .filter((res) => res?.code === 0)
    .flatMap((res) => (res.data as unknown as TeamType[]) || [])
  return allTeams
}
