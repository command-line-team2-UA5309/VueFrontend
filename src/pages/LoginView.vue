<template>
  <div class="auth-container">
    <h2>Log in</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="credentials.username" type="text" placeholder="Username" required />
      <input v-model="credentials.password" type="password" placeholder="Password" required />
      <button type="submit">Log in</button>
    </form>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <RouterLink to="/register">Don't have an account? Sign up</RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const credentials = ref({ username: '', password: '' })
const errorMsg = ref('')

const handleLogin = async () => {
  try {
    await authStore.login(credentials.value)
    router.push({ name: 'home' })
  } catch (error) {
    errorMsg.value = "Wrong username or password"
  }
}
</script>