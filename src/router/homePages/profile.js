/*资料*/
export default [{
  path: '/home/profile/personalCenter',
  name: "个人中心",
  component: resolve => require(['@/views/profile/personalCenter.vue'], resolve),
  redirect: '/home/profile/personalCenter/personalProfile',
  meta: {
    title: ['首页', '个人中心'],
  },
  children: [{
    path: '/home/profile/personalCenter/personalProfile',
    name: "个人资料 ",
    component: resolve => require(['@/views/profile/personalProfile.vue'], resolve),
    meta: {
      title: ['首页', '个人中心', '个人资料 '],
    }
  }, ]
}]
