<template>
  <div>
    <nav>
      <h2>Community home page</h2>
      <button @click="handleLogout">Log out</button>
    </nav>

    <SightingMap />

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SightingMap from '@/components/SightingMap.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>