/* 管理中心 */
export default [
  {
    path: '/home/manageHomePage',
    name: '管理中心',
    component: () => import('@/views/homePages/manageHomePage.vue'),
    meta: {
      title: ['首页', '管理中心'],
      keepAlive: true
    }
  },
  {
    path: '/home/manageHomePage/notice',
    name: '通知管理',
    component: () => import('@/views/manage/noticeManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '通知管理']
    }
  },
  {
    path: '/home/manageHomePage/app',
    name: '应用管理',
    component: () => import('@/views/manage/appManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '应用管理']
    }
  },
  {
    path: '/home/manageHomePage/user',
    name: '用户管理',
    component: () => import('@/views/manage/userManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '用户管理'],
      permission: 'system:user:list'
    }
  },
  {
    path: '/home/manageHomePage/role',
    name: '角色管理',
    component: () => import('@/views/manage/roleManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '角色管理'],
      permission: 'system:role:list'
    }
  },
  {
    path: '/home/manageHomePage/menu',
    name: '菜单配置',
    component: () => import('@/views/manage/menuManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '菜单配置'],
      permission: 'system:menu:list'
    }
  },
  {
    path: '/home/manageHomePage/logs',
    redirect: '/home/manageHomePage/logs/login',
    name: '日志管理',
    component: () => import('@/views/manage/logManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '日志管理']
    },
    children: [
      {
        path: 'login',
        name: '登录日志',
        component: () => import('@/views/manage/logManage/loginLog.vue')
      },
      {
        path: 'operation',
        name: '操作日志',
        component: () => import('@/views/manage/logManage/operationLog.vue')
      },
      {
        path: 'business',
        name: '业务日志',
        component: () => import('@/views/manage/logManage/businessLog.vue')
      },
      {
        path: 'statistics',
        name: '数据统计',
        component: () => import('@/views/manage/logManage/statistics.vue')
      }
    ]
  }
  // {
  //   path: "/home/manageHomePage/notice/detail",
  //   name: "通知详情",
  //   component: () => import("@/views/manage/noticeManage/detail.vue"),
  //   meta: {
  //     title: ["首页", "管理中心", "通知详情"],
  //   },
  // },
]
