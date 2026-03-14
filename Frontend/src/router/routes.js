function loadPage(component) {
  return () => import(`@/pages/${component}.vue`);
}

export default [
  {
    path: '/',
    component: loadPage('Home'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: loadPage('Login'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signUp',
    component: loadPage('SignUp'),
    meta: { requiresAuth: false }
  },
  {
    path: '/cal',
    component: loadPage('Calendar'),
    meta: { requiresAuth: true }
  }
];
