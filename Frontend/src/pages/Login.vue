<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { onMounted, onUnmounted } from 'vue'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPassword = ref(false)
const emailError = ref(false)
const passwordError = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  emailError.value = false
  passwordError.value = false

  let valid = true
  if (!email.value.trim()) { emailError.value = true; valid = false }
  if (password.value.length < 8) { passwordError.value = true; valid = false }
  if (!valid) { errorMessage.value = 'Please fill in all fields correctly.'; return }

  loading.value = true
  try {
    await login(email.value.trim(), password.value)
    router.push('/')
  } catch (e) {
    const code = e.code
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
      errorMessage.value = 'Invalid email or password.'
    } else {
      errorMessage.value = e.message
    }
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  document.body.classList.add('auth-page')
})

onUnmounted(() => {
  document.body.classList.remove('auth-page')
})
</script>

<template>
  <div class="wrapper">
    <h1>Habitual Log In</h1>
    <form id="form" @submit.prevent="handleLogin">

      <div :class="{ incorrect: emailError }">
        <label for="email_input">
          <!-- Email icon -->
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
          </svg>
        </label>
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
          <!-- Lock icon -->
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Zm-120 480v-400 400Z"/>
          </svg>
        </label>
        <input
          :type="showPassword ? 'text' : 'password'"
          id="password_input"
          v-model="password"
          placeholder="Enter Password"
          @input="passwordError = false"
          autocomplete="current-password"
        />
        <button type="button" class="toggle-password" @click="showPassword = !showPassword">
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Log In' }}
      </button>
      <p id="error_message">{{ errorMessage }}</p>
    </form>

    <p>Don't have an account? <router-link to="/signUp">Sign up here!</router-link></p>
  </div>
</template>

<style scoped>
.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent-color);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0;
  text-transform: uppercase;
}
form > div {
  position: relative;
}
.wrapper {
  min-height: 100vh;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center; /* horizontal center */
  align-items: center;     /* vertical center */
}
form {
  width: 100%;
  max-width: 400px;
}
</style>
