/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-19 22:07:49
 */
/*登录相关*/
export default [{
  path: '/login',
  alias: "/",
  name: "登录",
  component: resolve => require(['@/views/login/login.vue'], resolve),
  meta: {
    title: ['登录'],
  },
}]
