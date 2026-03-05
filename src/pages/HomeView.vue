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
<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2e7d32;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

nav h2 {
  margin: 0;
  font-weight: 500;
}

button {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #b71c1c;
}
</style>