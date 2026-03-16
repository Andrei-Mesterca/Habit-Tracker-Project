<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)

const usernameError = ref(false)
const emailError = ref(false)
const passwordError = ref(false)
const repeatError = ref(false)

async function handleSignUp() {
  errorMessage.value = ''
  usernameError.value = emailError.value = passwordError.value = repeatError.value = false

  const errors = []
  if (!username.value.trim()) { usernameError.value = true; errors.push('Username is required') }
  if (!email.value.trim()) { emailError.value = true; errors.push('Email is required') }
  if (password.value.length < 8) { passwordError.value = true; errors.push('Password must be at least 8 characters') }
  if (password.value !== repeatPassword.value) { repeatError.value = true; passwordError.value = true; errors.push('Passwords do not match') }
  if (errors.length) { errorMessage.value = errors.join('. '); return }

  loading.value = true
  try {
    // Backend creates user in Firebase Auth + saves profile to Firestore
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value.trim(),
        email: email.value.trim(),
        password: password.value
      })
    })
    const data = await res.json()
    if (!data.success) { errorMessage.value = data.error; return }

    // Sign in client-side so Firebase Auth session is established
    await login(email.value.trim(), password.value)
    router.push('/')
  } catch (e) {
    errorMessage.value = 'An error occurred. Please try again.'
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrapper">
    <h1>Habitual Sign-Up</h1>
    <form id="form" @submit.prevent="handleSignUp">

      <div :class="{ incorrect: usernameError }">
        <label for="username_input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
          </svg>
        </label>
        <input
          type="text"
          id="username_input"
          v-model="username"
          placeholder="Enter Username"
          @input="usernameError = false"
          autocomplete="username"
        />
      </div>

      <div :class="{ incorrect: emailError }">
        <label for="email_input"><span>@</span></label>
        <input
          type="email"
          id="email_input"
          v-model="email"
          placeholder="Enter Email"
          @input="emailError = false"
          autocomplete="email"
        />
      </div>

      <div :class="{ incorrect: passwordError }">
        <label for="password_input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Zm-120 480v-400 400Z"/>
          </svg>
        </label>
        <input
          type="password"
          id="password_input"
          v-model="password"
          placeholder="Enter Password"
          @input="passwordError = false"
          autocomplete="new-password"
        />
      </div>

      <div :class="{ incorrect: repeatError }">
        <label for="repeat_password_input">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Zm-120 480v-400 400Z"/>
          </svg>
        </label>
        <input
          type="password"
          id="repeat_password_input"
          v-model="repeatPassword"
          placeholder="Confirm Password"
          @input="repeatError = false"
          autocomplete="new-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating account...' : 'Sign Up' }}
      </button>
      <p id="error_message">{{ errorMessage }}</p>
    </form>

    <p>Already have an account? <router-link to="/login">Login</router-link></p>
  </div>
</template>

<style scoped></style>
