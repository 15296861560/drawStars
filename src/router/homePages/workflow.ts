/* 流程编排 — 用户端路由 */
export default [
  {
    path: '/home/workflowHomePage/status',
    name: '我的流程状态',
    component: () => import('@/views/workflow/status.vue'),
    meta: {
      title: ['首页', '我的流程状态'],
      keepAlive: true
    }
  }
]
