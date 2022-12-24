/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-04 22:05:29
 */
/*多媒体模块*/
export default [
  {
    path: "/home/multimediaHomePage",
    name: "多媒体模块",
    component: () => import("@/views/homePages/multimediaHomePage.vue"),
    meta: {
      title: ["首页", "多媒体模块"],
      keepAlive: true,
    },
  },
  {
    path: "/home/multimediaHomePage/simpleUse",
    name: "简单使用",
    component: () => import("@/views/multimedia/simpleUse.vue"),
    meta: {
      title: ["首页", "多媒体模块", "简单使用"],
    },
  },
  {
    path: "/home/multimediaHomePage/camera",
    name: "捕捉摄像头画面",
    component: () => import("@/views/multimedia/camera.vue"),
    meta: {
      title: ["首页", "多媒体模块", "捕捉摄像头画面"],
    },
  },
  {
    path: "/home/multimediaHomePage/processVideo",
    name: "处理视频",
    component: () => import("@/views/multimedia/processVideo.vue"),
    meta: {
      title: ["首页", "多媒体模块", "处理视频"],
    },
  },
  {
    path: "/home/multimediaHomePage/pictureEditing",
    name: "图片编辑",
    component: () => import("@/views/multimedia/pictureEditing/index.vue"),
    meta: {
      title: ["首页", "多媒体模块", "图片编辑"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/multimediaHomePage/pictureEditing",
        name: "裁剪图片",
        component: () => import("@/views/multimedia/pictureEditing/crop/index.vue"),
        meta: {
          title: ["首页", "多媒体模块", "图片编辑", "裁剪图片"],
        },
      },
    ],
  },
];
