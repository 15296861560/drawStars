/*工具模块*/
export default [{
    path: '/home/toolHomePage',
    name: "工具模块",
    component: resolve => require(['@/views/homePages/toolHomePage.vue'], resolve),
    meta: {
      title: ['首页', '工具模块'],
      keepAlive: true
    },
  }, {
    path: '/home/toolHomePage/Lodash',
    name: "Lodash",
    component: resolve => require(['@/views/tools/Lodash/Lodash.vue'], resolve),
    meta: {
      title: ['首页', '工具模块', 'Lodash'],
      keepAlive: true
    }
  },
  {
    path: '/home/toolHomePage/agora',
    name: "agora",
    component: resolve => require(['@/views/tools/Agora/agora.vue'], resolve),
    meta: {
      title: ['首页', '工具模块', 'agora'],
      keepAlive: true
    }
  },
  {
    path: '/home/toolHomePage/utilities',
    name: "工具列表",
    component: resolve => require(['@/views/tools/utilities/ToolList.vue'], resolve),
    meta: {
      title: ['首页', '工具模块', '工具列表'],
      keepAlive: true
    },
    children: [{
        path: '/home/toolHomePage/utilities/time',
        name: "时间",
        component: resolve => require(['@/views/tools/utilities/time.vue'], resolve),
        meta: {
          title: ['首页', '工具模块', '工具列表', '时间'],
        }
      },
      {
        path: '/home/toolHomePage/utilities/regex',
        name: "正则表达式",
        component: resolve => require(['@/views/tools/utilities/regex'], resolve),
        meta: {
          title: ['首页', '工具模块', '工具列表', '正则表达式'],
        }
      },
      {
        path: '/home/toolHomePage/utilities/importAndExport',
        name: "导入与导出",
        component: resolve => require(['@/views/tools/utilities/importAndExport'], resolve),
        meta: {
          title: ['首页', '工具模块', '工具列表', '导入与导出'],
        }
      },
    ]
  },
  {
    path: '/home/toolHomePage/practice',
    name: "练习室",
    component: resolve => require(['@/views/tools/practice'], resolve),
    meta: {
      title: ['首页', '工具模块', '练习室'],
    },
  },
  {
    path: '/home/toolHomePage/chat',
    name: "聊天室",
    component: resolve => require(['@/views/tools/chat'], resolve),
    meta: {
      title: ['首页', '工具模块', '聊天室'],
    },
  },
  {
    path: '/home/toolHomePage/translate',
    name: "翻译",
    component: resolve => require(['@/views/tools/translate'], resolve),
    meta: {
      title: ['首页', '工具模块', '翻译'],
    },
  },
  {
    path: '/home/toolHomePage/pay',
    name: "支付",
    component: resolve => require(['@/views/tools/pay/pay.vue'], resolve),
    meta: {
      title: ['首页', '工具模块', '支付'],
      keepAlive: true
    },
    children: [{
      path: '/home/toolHomePage/pay/Alipay',
      name: "支付宝 ",
      component: resolve => require(['@/views/tools/pay/Alipay.vue'], resolve),
      meta: {
        title: ['首页', '工具模块', '支付', '支付宝 '],
      }
    }, ]
  },
  {
    path: '/home/toolHomePage/compress',
    name: "压缩代码",
    component: resolve => require(['@/views/tools/compress'], resolve),
    meta: {
      title: ['首页', '工具模块', '压缩代码'],
    },
  },
]
