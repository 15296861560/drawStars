/* 心智测评中心（问星）—— 管理端五页（PRD 6.1 路由树） */
export default [
  {
    path: '/home/assessment',
    name: '心智测评中心',
    component: () => import('@/views/manage/assessmentManage/oa/index.vue'),
    meta: {
      title: ['首页', '心智测评中心', '公众号配置'],
      permission: 'assessment:oa:list'
    }
  },
  {
    path: '/home/assessment/list',
    name: '测评上架管理',
    component: () => import('@/views/manage/assessmentManage/list/index.vue'),
    meta: {
      title: ['首页', '心智测评中心', '测评上架管理'],
      permission: 'assessment:info:list'
    }
  },
  {
    path: '/home/assessment/channel',
    name: '渠道入口',
    component: () => import('@/views/manage/assessmentManage/channel/index.vue'),
    meta: {
      title: ['首页', '心智测评中心', '渠道入口'],
      permission: 'assessment:channel:list'
    }
  },
  {
    path: '/home/assessment/reply',
    name: '公众号回复规则',
    component: () => import('@/views/manage/assessmentManage/reply/index.vue'),
    meta: {
      title: ['首页', '心智测评中心', '公众号回复规则'],
      permission: 'assessment:reply:list'
    }
  },
  {
    path: '/home/assessment/stats',
    name: '数据看板',
    component: () => import('@/views/manage/assessmentManage/stats/index.vue'),
    meta: {
      title: ['首页', '心智测评中心', '数据看板'],
      permission: 'assessment:stats:view'
    }
  }
]
