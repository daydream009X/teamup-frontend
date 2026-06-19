import axios from 'axios'

const isDev = import.meta.env.MODE !== 'production'

const myAxios = axios.create({
  baseURL: isDev ? 'http://localhost:8080/api' : '',
  // : '线上地址'
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

// 响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    console.log('我收到你的愿望了', response)
    // 未登录则跳转到登录页
    if (response?.data?.code === 40100) {
      const redirectUrl = window.location.href
      window.location.href = `/user/login?redirect=${redirectUrl}`
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
