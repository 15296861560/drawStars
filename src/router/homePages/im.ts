/* IM 聊天体系 — 用户端路由 */
const IndexPage = () => import('@/views/im/Index.vue')

export default [
  {
    path: '/home/im',
    name: 'IM 聊天',
    component: IndexPage,
    meta: {
      title: ['首页', 'IM 聊天'],
      keepAlive: true,
      permission: 'tool:chat:use'
    }
  },
  // 侧边栏菜单项跳转入口（与 RBAC seed 的 im_hall / im_contacts path 对齐）
  {
    path: '/home/im/hall',
    name: 'IM 大厅',
    component: IndexPage,
    meta: {
      title: ['首页', 'IM 聊天', '社交大厅']
    }
  },
  {
    path: '/home/im/contacts',
    name: 'IM 通讯录',
    component: IndexPage,
    meta: {
      title: ['首页', 'IM 聊天', '通讯录']
    }
  },
  {
    path: '/home/im/profile',
    name: 'IM 资料与隐私',
    component: () => import('@/views/im/profile/Profile.vue'),
    meta: {
      title: ['首页', 'IM 聊天', '资料与隐私']
    }
  },
  {
    path: '/home/im/room/:roomId',
    name: 'IM 房间',
    component: () => import('@/views/im/room/Room.vue'),
    meta: {
      title: ['首页', 'IM 聊天', '房间']
    }
  }
]
