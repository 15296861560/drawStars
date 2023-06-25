/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 21:55:05
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-31 10:28:48
 */
import { createRouter, createWebHistory } from "vue-router";
import MyEcharts from "@/router/homePages/myEcharts.ts";
import MyComponents from "@/router/homePages/myComponents.ts";
import Tools from "@/router/homePages/tools.ts";
import Special from "@/router/homePages/special.ts";
import Data from "@/router/homePages/data.ts";
import Multimedia from "@/router/homePages/multimedia.ts";
import Case from "@/router/homePages/case.ts";
import Lab from "@/router/homePages/lab.ts";
import Resource from "@/router/homePages/resource.ts";
import Profile from "@/router/homePages/profile.ts";

export const RouterList = [
  {
    path: "/login",
    alias: "/",
    name: "登录",
    component: () => import("@/views/login/login.vue"),
    meta: {
      title: ["登录"],
    },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/Index.vue"),
    children: [
      {
        path: "/home/homepage",
        name: "首页",
        component: () => import("@/views/homePages/HomePage.vue"),
        meta: {
          title: ["首页"],
          keepAlive: true,
        },
      },
      {
        path: "/404",
        name: "NotFound",
        meta: {
          title: ["404"],
          keepAlive: true,
        },
        component: () => import("@/views/pages/NotFound.vue"),
      },
      ...MyEcharts,
      ...MyComponents,
      ...Tools,
      ...Special,
      ...Data,
      ...Multimedia,
      ...Case,
      ...Lab,
      ...Resource,
      ...Profile,
    ],
  },
  // 所有未定义路由，全部重定向到404页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: RouterList,
});

export default router;
