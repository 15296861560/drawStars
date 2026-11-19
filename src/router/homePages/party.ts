export default [
  {
    path: 'manageHomePage/party/questions',
    component: () => import('@/views/manage/partyManage/questions.vue'),
    name: 'managePartyQuestions',
    meta: {
      title: ['首页', '拾星趣局', '题目池管理'],
      permission: 'party:question:manage'
    }
  },
  {
    path: 'manageHomePage/party/themes',
    component: () => import('@/views/manage/partyManage/themes.vue'),
    name: 'managePartyThemes',
    meta: {
      title: ['首页', '拾星趣局', '主题管理'],
      permission: 'party:theme:manage'
    }
  },
  {
    path: 'manageHomePage/party/games',
    component: () => import('@/views/manage/partyManage/games.vue'),
    name: 'managePartyGames',
    meta: {
      title: ['首页', '拾星趣局', '游戏配置'],
      permission: 'party:game:config'
    }
  },
  {
    path: 'manageHomePage/party/sessions',
    component: () => import('@/views/manage/partyManage/sessions.vue'),
    name: 'managePartySessions',
    meta: {
      title: ['首页', '拾星趣局', '对局查询'],
      permission: 'party:session:view'
    }
  },
  {
    path: 'manageHomePage/party/stats',
    component: () => import('@/views/manage/partyManage/stats.vue'),
    name: 'managePartyStats',
    meta: {
      title: ['首页', '拾星趣局', '数据统计'],
      permission: 'party:stats:view'
    }
  },
  {
    path: 'manageHomePage/party/audit',
    component: () => import('@/views/manage/partyManage/audit.vue'),
    name: 'managePartyAudit',
    meta: {
      title: ['首页', '拾星趣局', '内容审核'],
      permission: 'party:content:audit'
    }
  }
]
