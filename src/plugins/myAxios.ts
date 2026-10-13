import axios from 'axios'

const isDev = import.meta.env.MODE !== 'production'

const myAxios = axios.create({
  baseURL: isDev ? 'http://localhost:8081/api' : '/partner-match-api',
})

myAxios.defaults.withCredentials = true // 配置为true

// 请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    console.log('我要许下愿望了', config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

const getInternalRedirectPath = () => {
  const { pathname, search, hash } = window.location
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path =
    basePath && basePath !== '/' && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || '/'
      : pathname

  return `${path.startsWith('/') ? path : `/${path}`}${search}${hash}`
}

// 响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    console.log('我收到你的愿望了', response)
    // 当前用户探测和登录页本身不触发全局跳转，避免登录页循环刷新。
    if (response?.data?.code === 40100) {
      const requestUrl = response.config.url ?? ''
      const isCurrentUserRequest = requestUrl.includes('/user/current')
      const isLoginPage = window.location.pathname.endsWith('/user/login')

      if (!isCurrentUserRequest && !isLoginPage) {
        const redirectPath = getInternalRedirectPath()
        window.location.href = `${import.meta.env.BASE_URL}user/login?redirect=${encodeURIComponent(redirectPath)}`
      }
    }
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  },
)

export default myAxios as unknown as {
  get<T = Record<string, unknown>>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<{ code: number; data: T; message: string; description: string }>
  post<T = Record<string, unknown>>(
    url: string,
    data?: Record<string, unknown>,
    config?: Record<string, unknown>,
  ): Promise<{ code: number; data: T; message: string; description: string }>
  interceptors: typeof myAxios.interceptors
  defaults: typeof myAxios.defaults
}
