import axios, { type AxiosInstance } from 'axios'

const isDev = import.meta.env.MODE !== 'production'

const myAxios: AxiosInstance = axios.create({
  baseURL: isDev ? 'http://localhost:8080/api' : '',
  // : '线上地址'
})

myAxios.defaults.withCredentials = true // 配置为true

// Add a request interceptor
myAxios.interceptors.request.use(
  function (config) {
    console.log('我要许下愿望了', config)
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// Add a response interceptor
myAxios.interceptors.response.use(
  function (response) {
    console.log('我收到你的回应了', response)
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

export default myAxios
