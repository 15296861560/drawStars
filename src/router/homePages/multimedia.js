/*多媒体模块*/
export default [{
    path: '/home/multimediaHomePage',
    name: "多媒体模块",
    component: resolve => require(['@/views/homePages/multimediaHomePage.vue'], resolve),
    meta: {
      title: ['首页', '多媒体模块'],
    },
  },
  {
    path: '/home/multimediaHomePage/simpleUse',
    name: "简单使用",
    component: resolve => require(['@/views/multimedia/simpleUse.vue'], resolve),
    meta: {
      title: ['首页', '多媒体模块', '简单使用'],
      keepAlive: true
    }
  },
  {
    path: '/home/multimediaHomePage/camera',
    name: "捕捉摄像头画面",
    component: resolve => require(['@/views/multimedia/camera.vue'], resolve),
    meta: {
      title: ['首页', '多媒体模块', '捕捉摄像头画面'],
      keepAlive: true
    }
  },
]
