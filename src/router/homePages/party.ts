export default [
  {
    path: 'manageHomePage/party/questions',
    component: () => import('@/views/manage/partyManage/questions.vue'),
    name: 'managePartyQuestions',
    meta: {
      title: '活动拾星趣局题目池管理',
      permission: 'party:question:manage'
    }
  },
  {
    path: 'manageHomePage/party/themes',
    component: () => import('@/views/manage/partyManage/themes.vue'),
    name: 'managePartyThemes',
    meta: {
      title: '活动拾星趣局主题管理',
      permission: 'party:theme:manage'
    }
  },
  {
    path: 'manageHomePage/party/games',
    component: () => import('@/views/manage/partyManage/games.vue'),
    name: 'managePartyGames',
    meta: {
      title: '活动拾星趣局游戏配置',
      permission: 'party:game:config'
    }
  },
  {
    path: 'manageHomePage/party/sessions',
    component: () => import('@/views/manage/partyManage/sessions.vue'),
    name: 'managePartySessions',
    meta: {
      title: '活动拾星趣局对局查询',
      permission: 'party:session:view'
    }
  },
  {
    path: 'manageHomePage/party/stats',
    component: () => import('@/views/manage/partyManage/stats.vue'),
    name: 'managePartyStats',
    meta: {
      title: '活动拾星趣局数据统计',
      permission: 'party:stats:view'
    }
  },
  {
    path: 'manageHomePage/party/audit',
    component: () => import('@/views/manage/partyManage/audit.vue'),
    name: 'managePartyAudit',
    meta: {
      title: '活动拾星趣局内容审核',
      permission: 'party:content:audit'
    }
  }
]
