import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import SignUp from '@/pages/SignUp.vue'
import Calendar from '@/pages/Calendar.vue'

export default [
  {
    path: '/',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signUp',
    component: SignUp,
    meta: { requiresAuth: false }
  },
  {
    path: '/cal',
    component: Calendar,
    meta: { requiresAuth: true }
  }
];
