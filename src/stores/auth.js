// @ts-nocheck
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const role = ref(null)
  const isAuthenticated = ref(false)

  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded.exp * 1000 > Date.now()) {
          role.value = decoded.role
          isAuthenticated.value = true
        } else {
          logoutLocally()
        }
      } catch (e) {
        logoutLocally()
      }
    }
  }

  const login = async (credentials) => {
    const response = await api.post('login/', credentials)
    localStorage.setItem('access_token', response.data.access)
    localStorage.setItem('refresh_token', response.data.refresh)
    
    const decoded = jwtDecode(response.data.access)
    role.value = decoded.role
    isAuthenticated.value = true
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('logout/', { refresh }) 
    } catch (error) {
      console.error("Logout error", error)
    } finally {
      logoutLocally()
    }
  }

  const logoutLocally = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    role.value = null
    isAuthenticated.value = false
  }

  checkAuth()
  return { role, isAuthenticated, login, logout, checkAuth }
})