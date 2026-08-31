import myAxios from '@/plugins/myAxios'
import qs from 'qs'
import type { UserType } from '@/models/user.d.ts'

/**
 * 用户登录
 */
export const login = (data: { userAccount: string; userPassword: string }) =>
  myAxios.post<UserType>('/user/login', data)

/**
 * 用户注册
 */
export const register = (data: {
  userAccount: string
  userPassword: string
  checkPassword: string
  planetCode: string
  username: string
}) => myAxios.post('/user/register', data)

/**
 * 用户登出
 */
export const logout = () => myAxios.post('/user/logout')

/**
 * 获取当前登录用户
 */
export const getCurrentUser = async () => {
  const res = await myAxios.get<UserType>('/user/current')

  if (res.code === 0 && res.data) {
    return res.data
  }

  if (res.code === 40100) {
    return null
  }

  throw new Error(res.description || res.message || '获取当前用户失败')
}

/**
 * 更新用户信息
 */
export const updateUser = (data: Record<string, unknown>) => myAxios.post('/user/update', data)

/**
 * 极速匹配（根据标签匹配用户）
 */
export const matchUsers = (num: number) => myAxios.get('/user/match', { params: { num } })

/**
 * 推荐用户（分页查询）
 */
export const recommendUsers = (pageSize: number, pageNum: number) =>
  myAxios.get('/user/recommend', { params: { pageSize, pageNum } })

/**
 * 按标签搜索用户
 */
export const searchUsersByTags = (tagNameList: string | string[]) =>
  myAxios.get('/user/search/tags', {
    params: { tagNameList },
    paramsSerializer: (params: Record<string, unknown>) => qs.stringify(params, { indices: false }),
  })
