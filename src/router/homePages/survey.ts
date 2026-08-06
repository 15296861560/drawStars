/* 问卷管理 */
export default [
  {
    path: '/home/surveyHomePage',
    name: '问卷管理',
    component: () => import('@/views/homePages/surveyHomePage.vue'),
    meta: {
      title: ['首页', '问卷管理'],
      keepAlive: true
    }
  },
  {
    path: '/home/survey',
    name: '问卷列表',
    component: () => import('@/views/survey/list/index.vue'),
    meta: {
      title: ['首页', '问卷管理'],
      permission: 'survey:questionnaire:list'
    }
  },
  {
    path: '/home/survey/create',
    name: '创建问卷',
    component: () => import('@/views/survey/editor/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '创建问卷'],
      permission: 'survey:questionnaire:create'
    }
  },
  {
    path: '/home/survey/edit/:id',
    name: '编辑问卷',
    component: () => import('@/views/survey/editor/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '编辑问卷'],
      permission: 'survey:questionnaire:update'
    }
  },
  {
    path: '/home/survey/preview/:id',
    name: '预览问卷',
    component: () => import('@/views/survey/preview/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '预览'],
      permission: 'survey:questionnaire:list'
    }
  },
  {
    path: '/home/survey/analysis/:id',
    name: '问卷分析',
    component: () => import('@/views/survey/analysis/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '数据分析'],
      permission: 'survey:questionnaire:analyze'
    }
  },
  {
    path: '/home/survey/grading/:id',
    name: '阅卷工作台',
    component: () => import('@/views/survey/grading/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '阅卷'],
      permission: 'survey:questionnaire:grading'
    }
  },
  {
    path: '/home/survey/template',
    name: '问卷模板',
    component: () => import('@/views/survey/template/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '模板管理'],
      permission: 'survey:questionnaire:template'
    }
  },
  {
    path: '/home/survey/question-bank',
    name: '题库管理',
    component: () => import('@/views/survey/questionBank/index.vue'),
    meta: {
      title: ['首页', '问卷管理', '题库管理'],
      permission: 'survey:questionnaire:questionBank'
    }
  }
]
