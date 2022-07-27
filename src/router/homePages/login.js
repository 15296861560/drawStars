/*登录相关*/
export default [{
  path: '/login',
  name: "登录",
  component: resolve => require(['@/views/login/login.vue'], resolve),
  meta: {
    title: ['登录'],
  },
}]
