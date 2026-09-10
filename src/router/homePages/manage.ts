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
      title: ['首页', '管理中心', '应用管理'],
      permission: 'system:app:list'
    }
  },
  {
    path: '/home/manageHomePage/app/opsBanner',
    name: 'appOpsBanner',
    component: () => import('@/views/manage/appManage/opsBanner.vue'),
    meta: {
      title: ['首页', '管理中心', '运营 Banner'],
      permission: 'system:app:ops'
    }
  },
  {
    path: '/home/manageHomePage/app/debugWhitelist',
    name: 'appDebugWhitelist',
    component: () => import('@/views/manage/appManage/debugWhitelist.vue'),
    meta: {
      title: ['首页', '管理中心', '调试白名单'],
      permission: 'system:app:publish'
    }
  },
  {
    path: '/home/manageHomePage/app/shell',
    name: '壳版本发布',
    component: () => import('@/views/manage/appManage/shellRelease.vue'),
    meta: {
      title: ['首页', '管理中心', '壳版本发布'],
      permission: 'system:shell:release'
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
    path: '/home/manageHomePage/points',
    redirect: '/home/manageHomePage/points/overview',
    name: '积分管理',
    component: () => import('@/views/manage/pointsManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '积分管理'],
      permission: 'system:points:list'
    },
    children: [
      {
        path: 'overview',
        name: '积分概览',
        component: () => import('@/views/manage/pointsManage/overview.vue'),
        meta: {
          title: ['首页', '管理中心', '积分管理', '概览']
        }
      },
      {
        path: 'adjust',
        name: '新增积分',
        component: () => import('@/views/manage/pointsManage/adjust.vue'),
        meta: {
          title: ['首页', '管理中心', '积分管理', '新增积分'],
          permission: 'system:points:operate'
        }
      },
      {
        path: 'rules',
        name: '积分规则配置',
        component: () => import('@/views/manage/pointsManage/rules.vue'),
        meta: {
          title: ['首页', '管理中心', '积分管理', '规则配置'],
          permission: 'system:points:list'
        }
      },
      {
        path: 'levels',
        name: '积分等级配置',
        component: () => import('@/views/manage/pointsManage/levels.vue'),
        meta: {
          title: ['首页', '管理中心', '积分管理', '等级配置'],
          permission: 'system:points:list'
        }
      }
    ]
  },
  {
    path: '/home/manageHomePage/task',
    redirect: '/home/manageHomePage/task/overview',
    name: '任务管理',
    component: () => import('@/views/manage/taskManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '任务管理'],
      permission: 'system:task:list'
    },
    children: [
      {
        path: 'overview',
        name: '任务概览',
        component: () => import('@/views/manage/taskManage/overview.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '任务概览']
        }
      },
      {
        path: 'list',
        name: '任务列表',
        component: () => import('@/views/manage/taskManage/list.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '任务列表'],
          permission: 'system:task:list'
        }
      },
      {
        path: 'audit',
        name: '任务审核',
        component: () => import('@/views/manage/taskManage/audit.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '任务审核'],
          permission: 'system:task:audit'
        }
      },
      {
        path: 'shipping',
        name: '奖励发放',
        component: () => import('@/views/manage/taskManage/shipping.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '奖励发放'],
          permission: 'system:task:operate'
        }
      },
      {
        path: 'categories',
        name: '分类管理',
        component: () => import('@/views/manage/taskManage/categories.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '分类管理'],
          permission: 'system:task:operate'
        }
      },
      {
        path: 'templates',
        name: '奖励模板',
        component: () => import('@/views/manage/taskManage/templates.vue'),
        meta: {
          title: ['首页', '管理中心', '任务管理', '奖励模板'],
          permission: 'system:task:operate'
        }
      }
    ]
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
  },
  {
    path: '/home/manageHomePage/workflow',
    redirect: '/home/manageHomePage/workflow/overview',
    name: '流程编排',
    component: () => import('@/views/manage/workflowManage/index.vue'),
    meta: {
      title: ['首页', '管理中心', '流程编排'],
      permission: 'system:workflow:list'
    },
    children: [
      {
        path: 'overview',
        name: '流程概览',
        component: () => import('@/views/manage/workflowManage/overview.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '流程概览']
        }
      },
      {
        path: 'list',
        name: '流程列表',
        component: () => import('@/views/manage/workflowManage/list.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '流程列表']
        }
      },
      {
        path: 'designer/:id?',
        name: '流程编排器',
        component: () => import('@/views/manage/workflowManage/designer.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '流程编排器'],
          permission: 'system:workflow:design'
        }
      },
      {
        path: 'execution/:id',
        name: '执行详情',
        component: () => import('@/views/manage/workflowManage/execution.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '执行详情']
        }
      },
      {
        path: 'history',
        name: '执行历史',
        component: () => import('@/views/manage/workflowManage/history.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '执行历史']
        }
      },
      {
        path: 'templates',
        name: '模板市场',
        component: () => import('@/views/manage/workflowManage/templates.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '模板市场']
        }
      },
      {
        path: 'tools',
        name: '工具管理',
        component: () => import('@/views/manage/workflowManage/tools.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '工具管理']
        }
      },
      {
        path: 'categories',
        name: '流程分类',
        component: () => import('@/views/manage/workflowManage/categories.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '流程分类'],
          permission: 'system:workflow:operate'
        }
      },
      {
        path: 'alerts',
        name: '告警规则',
        component: () => import('@/views/manage/workflowManage/alerts.vue'),
        meta: {
          title: ['首页', '管理中心', '流程编排', '告警规则'],
          permission: 'system:workflow:operate'
        }
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
