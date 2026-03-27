import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import SignUp from '@/pages/SignUp.vue'
import Calendar from '@/pages/Calendar.vue'
import Analysis from '@/pages/Analysis.vue'
import Explore from '@/pages/Explore.vue'

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
  },
  {
    path: '/ana',
    component: Analysis,
    meta: { requiresAuth: true }
  },
  {
    path: '/exp',
    component: Explore,
    meta: { requiresAuth: true }
  }
];
