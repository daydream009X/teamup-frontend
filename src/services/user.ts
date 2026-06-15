import myAxios from '@/plugins/myAxios'

/**
 * 获取当前登录用户
 */
export const getCurrentUser = async () => {
  try {
    const res = await myAxios.get('/user/current')
    return res?.data
  } catch {
    return null
  }
}
