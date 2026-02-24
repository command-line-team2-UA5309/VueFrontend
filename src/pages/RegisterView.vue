<template>
  <div>
    <h2>Create an account</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="form.username" type="text" placeholder="Username" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.password" type="password" placeholder="Password" required />
      <button type="submit">Sign up</button>
    </form>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    <RouterLink to="/login">Already have an account? Log in</RouterLink>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const form = ref({ username: '', email: '', password: '' })
const errorMsg = ref('')

const handleRegister = async () => {
  try {
    await api.post('register/', form.value)
    router.push({ name: 'login' })
  } catch (error) {
    errorMsg.value = "There was an error while trying to create an account"
  }
}
</script>