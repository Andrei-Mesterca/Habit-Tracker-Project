import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router/routes'
import { auth } from './firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({ history: createWebHistory(), routes })

// Wait for Firebase to restore the auth session before processing the first guard.
// Without this, auth.currentUser is null on hard refresh and the user gets
// bounced to /login even though they are logged in.
let authResolved = false;
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    authResolved = true;
    unsubscribe(); // Only need the first emission
    resolve(user);
  });
});

router.beforeEach(async (to) => {
  // Block navigation until we know the auth state
  if (!authResolved) await authReady;

  const user = auth.currentUser;
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth && !user) {
    return '/login';
  }

  // Redirect already-logged-in users away from login/signup
  if (!requiresAuth && user && (to.path === '/login' || to.path === '/signUp')) {
    return '/';
  }
});

const app = createApp(App)
app.use(router)
app.mount('#app')
