function loadPage(component){
    return () =>import(`@/pages/${component}.vue`)}
export default[
    {path:'/',component:loadPage('Home')},
    {path:'/login',component:loadPage('Login')},
    {path:'/signUp',component:loadPage('SignUp')},
    {path:'/cal',component:loadPage('Calendar')}
]