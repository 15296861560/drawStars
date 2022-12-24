/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-26 23:59:09
 */
/*登录相关*/
export default [
  {
    path: "/login",
    alias: "/",
    name: "登录",
    component: () => import("@/views/login/login.vue"),
    meta: {
      title: ["登录"],
    },
  },
];
