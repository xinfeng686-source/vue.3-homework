import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ---- 请求拦截器 ----
request.interceptors.request.use(
  (config) => {
    // 在发送请求前处理（如附加 token）
    // config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ---- 响应拦截器 ----
request.interceptors.response.use(
  (response) => {
    // 直接返回 data，简化调用方
    return response.data
  },
  (error) => {
    // 统一错误处理（如 401 跳登录、网络异常提示等）
    return Promise.reject(error)
  }
)

export default request
