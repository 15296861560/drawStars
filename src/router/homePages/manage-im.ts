/* IM 聊天体系 — 管理端路由 */
export default [
  {
    path: '/home/manageHomePage/chat',
    name: '聊天管理',
    component: () => import('@/views/manage/im/Index.vue'),
    meta: {
      title: ['首页', '管理中心', '聊天管理'],
      keepAlive: true,
      permission: 'system:chat:list'
    }
  }
]
