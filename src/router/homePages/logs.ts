/* 日志管理 */
export default [
  {
    path: '/home/logs/operation',
    name: 'logManageOperation',
    component: () => import('@/views/logs/operationLog.vue'),
    meta: {
      title: ['首页', '日志管理', '操作日志'],
      keepAlive: true
    }
  },
  {
    path: '/home/logs/business',
    name: 'logManageBusiness',
    component: () => import('@/views/logs/businessLog.vue'),
    meta: {
      title: ['首页', '日志管理', '业务日志'],
      keepAlive: true
    }
  },
  {
    path: '/home/logs/api',
    name: 'logManageApi',
    component: () => import('@/views/logs/apiLog.vue'),
    meta: {
      title: ['首页', '日志管理', '接口日志'],
      keepAlive: true
    }
  },
  {
    path: '/home/logs/performance',
    name: 'logManagePerformance',
    component: () => import('@/views/logs/performanceLog.vue'),
    meta: {
      title: ['首页', '日志管理', '性能日志'],
      keepAlive: true
    }
  }
]
