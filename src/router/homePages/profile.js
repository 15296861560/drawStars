/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-06-12 22:06:41
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-23 23:33:48
 */
/*资料*/
export default [{
  path: '/home/personalCenter',
  name: "个人中心",
  component: resolve => require(['@/views/profile/personalCenter.vue'], resolve),
  meta: {
    title: ['首页', '个人中心'],
    keepAlive: true
  },
  children: [{
    path: '/home/personalCenter/personalProfile',
    name: "个人资料 ",
    component: resolve => require(['@/views/profile/personalProfile.vue'], resolve),
    meta: {
      title: ['首页', '个人中心', '个人资料 '],
      keepAlive: true
    }
  }, ]
}]
