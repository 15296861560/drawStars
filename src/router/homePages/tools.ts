/*工具模块*/
export default [
  {
    path: "/home/toolHomePage",
    name: "工具模块",
    component: () => import("@/views/homePages/toolHomePage.vue"),
    meta: {
      title: ["首页", "工具模块"],
      keepAlive: true,
    },
  },
  {
    path: "/home/toolHomePage/Lodash",
    name: "Lodash",
    component: () => import("@/views/tools/Lodash/Lodash.vue"),
    meta: {
      title: ["首页", "工具模块", "Lodash"],
      keepAlive: true,
    },
  },
  {
    path: "/home/toolHomePage/agora",
    name: "agora",
    component: () => import("@/views/tools/Agora/agora.vue"),
    meta: {
      title: ["首页", "工具模块", "agora"],
      keepAlive: true,
    },
  },
  {
    path: "/home/toolHomePage/utilities",
    name: "工具列表",
    component: () => import("@/views/tools/utilities/ToolList.vue"),
    meta: {
      title: ["首页", "工具模块", "工具列表"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/toolHomePage/utilities/time",
        name: "时间",
        component: () => import("@/views/tools/utilities/time.vue"),
        meta: {
          title: ["首页", "工具模块", "工具列表", "时间"],
        },
      },
      {
        path: "/home/toolHomePage/utilities/regex",
        name: "正则表达式",
        component: () => import("@/views/tools/utilities/regex/index.vue"),
        meta: {
          title: ["首页", "工具模块", "工具列表", "正则表达式"],
        },
      },
      {
        path: "/home/toolHomePage/utilities/importAndExport",
        name: "导入与导出",
        component: () => import("@/views/tools/utilities/importAndExport/index.vue"),
        meta: {
          title: ["首页", "工具模块", "工具列表", "导入与导出"],
        },
      },
    ],
  },
  {
    path: "/home/toolHomePage/practice",
    name: "练习室",
    component: () => import("@/views/tools/practice/index.vue"),
    meta: {
      title: ["首页", "工具模块", "练习室"],
    },
  },
  {
    path: "/home/toolHomePage/chat",
    name: "聊天室",
    component: () => import("@/views/tools/chat/index.vue"),
    meta: {
      title: ["首页", "工具模块", "聊天室"],
    },
  },
  {
    path: "/home/toolHomePage/translate",
    name: "翻译",
    component: () => import("@/views/tools/translate/index.vue"),
    meta: {
      title: ["首页", "工具模块", "翻译"],
    },
  },
  {
    path: "/home/toolHomePage/pay",
    name: "支付",
    component: () => import("@/views/tools/pay/pay.vue"),
    meta: {
      title: ["首页", "工具模块", "支付"],
      keepAlive: true,
    },
    children: [
      {
        path: "/home/toolHomePage/pay/alipay",
        name: "支付宝 ",
        component: () => import("@/views/tools/pay/alipay.vue"),
        meta: {
          title: ["首页", "工具模块", "支付", "支付宝 "],
        },
      },
    ],
  },
  {
    path: "/home/toolHomePage/compress",
    name: "压缩代码",
    component: () => import("@/views/tools/compress/index.vue"),
    meta: {
      title: ["首页", "工具模块", "压缩代码"],
    },
  },
];
