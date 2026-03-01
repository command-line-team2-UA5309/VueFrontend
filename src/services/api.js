// @ts-nocheck
import axios from 'axios'

const host = import.meta.env.VITE_API_HOST
const port = import.meta.env.VITE_API_PORT

const api = axios.create({
  baseURL: `http://${host}:${port}/api/`
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api