import axios from 'axios'
import { router } from '@/router/router'

const host = import.meta.env.VITE_API_HOST
const port = import.meta.env.VITE_API_PORT
const mapPort = import.meta.env.VITE_MAP_API_PORT

const api = axios.create({
  baseURL: `http://${host}:${port}/api/`
})

export const mapApi = axios.create({
  baseURL: `http://${host}:${mapPort}/api/`
})

const tokenInterceptor = (config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(tokenInterceptor)
mapApi.interceptors.request.use(tokenInterceptor)


const tokenResponseInterceptor = async (error) => {
  const originalRequest = error.config
  const isExpired = error.response?.status === 401 || 
                    (error.response?.status === 403 && error.response?.data?.detail === "Token expired")


  if (isExpired) {
    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refresh_token')
    
    if (refreshToken) {
      try {
        // use refresh token to get a new access token
        const refreshResponse = await axios.post(`http://${host}:${authPort}/api/token/refresh/`, {
          refresh: refreshToken
        })

        const newAccessToken = refreshResponse.data.access
        localStorage.setItem('access_token', newAccessToken)

        // retry the failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axios(originalRequest) 

      } catch (refreshError) {
        // if the refresh token itself is expired, log out the user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        router.push({ name: 'login' })
        return Promise.reject(refreshError)
      }
    }
  }


  return Promise.reject(error)
}

api.interceptors.response.use((response) => response, tokenResponseInterceptor)
mapApi.interceptors.response.use((response) => response, tokenResponseInterceptor)


export default api