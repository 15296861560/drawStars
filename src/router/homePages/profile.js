/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-06-12 22:06:41
 * @LastEditors: lgy
 * @LastEditTime: 2022-08-07 20:58:12
 */
/*资料*/
export default [{
  path: '/home/personalCenter',
  name: "个人中心",
  component: resolve => require(['@/views/profile/personalCenter.vue'], resolve),
  meta: {
    title: ['首页', '个人中心'],
  },
  children: [{
    path: '/home/personalCenter/personalProfile',
    name: "个人资料 ",
    component: resolve => require(['@/views/profile/personalProfile.vue'], resolve),
    meta: {
      title: ['首页', '个人中心', '个人资料 '],
    }
  }, ]
}]
