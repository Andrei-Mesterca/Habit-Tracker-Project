<script setup>
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { currentUser, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <nav class="app-nav">
    <router-link to="/" class="nav-brand">🌿 Habitual</router-link>

    <div class="nav-links" v-if="currentUser">
      <router-link to="/" class="nav-link">Habits</router-link>
      <router-link to="/cal" class="nav-link">Calendar</router-link>
      <span class="nav-user">{{ currentUser.displayName }}</span>
      <button class="nav-logout" @click="handleLogout">Log Out</button>
    </div>

    <div class="nav-links" v-else>
      <router-link to="/login" class="nav-link">Login</router-link>
      <router-link to="/signUp" class="nav-link nav-link--cta">Sign Up</router-link>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 58px;
  background: #fff;
  border-bottom: 1.5px solid #d4ead9;
  font-family: 'Montserrat', sans-serif;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-brand {
  font-size: 1.1rem;
  font-weight: 800;
  color: #2B8C64;
  text-decoration: none;
  letter-spacing: -0.3px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3a5a3a;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  transition: background 150ms, color 150ms;
}
.nav-link:hover, .nav-link.router-link-active { background: #edf4ee; color: #2B8C64; }
.nav-link--cta {
  background: #2B8C64;
  color: #fff;
  border-radius: 100px;
}
.nav-link--cta:hover { background: #1f6b4b; color: #fff; }
.nav-user {
  font-size: 0.82rem;
  font-weight: 600;
  color: #5a7a5a;
  padding: 0 6px;
}
.nav-logout {
  background: none;
  border: 1.5px solid #d4ead9;
  border-radius: 100px;
  padding: 5px 14px;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: #5a7a5a;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.nav-logout:hover { background: #fff0f0; color: #aa010d; border-color: #aa010d; }
</style>
