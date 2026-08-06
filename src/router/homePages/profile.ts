/* 资料 / 账号设置 */
export default [
  {
    path: '/home/personalCenter',
    name: '个人中心',
    component: () => import('@/views/profile/personalCenter.vue'),
    meta: {
      title: ['首页', '个人中心'],
      keepAlive: true
    },
    redirect: '/home/personalCenter/basicInfo',
    children: [
      {
        path: '/home/personalCenter/basicInfo',
        name: '基础信息',
        component: () => import('@/views/profile/basicInfo.vue'),
        meta: {
          title: ['首页', '个人中心', '基础信息'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/credentials',
        name: '登录凭证',
        component: () => import('@/views/profile/credentials.vue'),
        meta: {
          title: ['首页', '个人中心', '登录凭证'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/oauthBind',
        name: '第三方关联',
        component: () => import('@/views/profile/oauthBind.vue'),
        meta: {
          title: ['首页', '个人中心', '第三方关联'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/notifySettings',
        name: '通知设置',
        component: () => import('@/views/profile/notifySettings.vue'),
        meta: {
          title: ['首页', '个人中心', '通知设置'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/roles',
        redirect: '/home/personalCenter/basicInfo'
      },
      {
        path: '/home/personalCenter/lifecycle',
        name: '账号安全',
        component: () => import('@/views/profile/lifecycle.vue'),
        meta: {
          title: ['首页', '个人中心', '账号安全'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/points',
        name: '我的积分',
        component: () => import('@/views/profile/points.vue'),
        meta: {
          title: ['首页', '个人中心', '我的积分'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/taskHall',
        name: '任务大厅(个人)',
        component: () => import('@/views/task/hall.vue'),
        meta: {
          title: ['首页', '个人中心', '任务大厅'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/myTasks',
        name: '我的任务(个人)',
        component: () => import('@/views/task/my.vue'),
        meta: {
          title: ['首页', '个人中心', '我的任务'],
          keepAlive: true
        }
      },
      {
        path: '/home/personalCenter/taskAchievements',
        name: '任务成就(个人)',
        component: () => import('@/views/task/achievements.vue'),
        meta: {
          title: ['首页', '个人中心', '成就墙'],
          keepAlive: true
        }
      },
      // 旧路径兼容
      {
        path: '/home/personalCenter/personalProfile',
        redirect: '/home/personalCenter/basicInfo'
      },
      {
        path: '/home/personalCenter/changePassword',
        redirect: '/home/personalCenter/credentials'
      },
      {
        path: '/home/personalCenter/bindPhone',
        redirect: '/home/personalCenter/credentials'
      },
      {
        path: '/home/personalCenter/accountSettings',
        redirect: '/home/personalCenter/credentials'
      }
    ]
  }
]
