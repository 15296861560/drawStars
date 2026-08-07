/* 任务大厅 / 我的任务 / 成就 */
export default [
  {
    path: '/home/taskHall',
    name: '任务大厅',
    component: () => import('@/views/task/hall.vue'),
    meta: {
      title: ['首页', '任务大厅'],
      keepAlive: true
    }
  },
  {
    path: '/home/taskHall/my',
    name: '我的任务',
    component: () => import('@/views/task/my.vue'),
    meta: {
      title: ['首页', '任务大厅', '我的任务']
    }
  },
  {
    path: '/home/taskHall/achievements',
    name: '任务成就',
    component: () => import('@/views/task/achievements.vue'),
    meta: {
      title: ['首页', '任务大厅', '成就墙']
    }
  }
]
