<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create an account</h2>
      <form @submit.prevent="handleRegister">
        <input v-model="form.username" type="text" placeholder="Username" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
        <input v-model="form.password" type="password" placeholder="Password" required />
        <button type="submit">Sign up</button>
      </form>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      
      <div class="auth-links">
        <RouterLink to="/login">Already have an account? Log in</RouterLink>
      </div>
    </div>
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

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.auth-card {
  background: white;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-top: 0;
  color: #2e7d32;
  text-align: center;
  margin-bottom: 25px;
}

form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 15px;
  padding: 12px;
  box-sizing: border-box;
  font-family: inherit;
  border: 1px solid #a5d6a7;
  border-radius: 6px;
  background-color: #fcfcfc;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

button {
  background-color: #2e7d32;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: opacity 0.2s;
  margin-top: 10px;
}

button:hover {
  opacity: 0.85;
}

.error {
  color: #d32f2f;
  margin-top: 15px;
  font-weight: bold;
  text-align: center;
}

.auth-links {
  margin-top: 20px;
  text-align: center;
}

.auth-links a {
  color: #2e7d32;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.auth-links a:hover {
  color: #1b5e20;
  text-decoration: underline;
}
</style>