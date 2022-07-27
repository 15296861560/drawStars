/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:08
 * @LastEditors: lgy
 * @LastEditTime: 2022-07-25 23:08:06
 */
export default {
  state: {
    userInfo: {
      name: "",
      userId: 0
    },
  },
  mutations: {
    changeUserInfo(state, {
      attr,
      val
    }) {
      state[attr] = val
    }
  },
  getters: {
    getUserInfo(state) {
      return state.userInfo
    },
    getUserId(state) {
      return state.userInfo.id
    },
    getUserName(state) {
      return state.userInfo.name || '未登录'
    },
  },
  actions: {
    changeUserInfo(context, {
      attr,
      val
    }) {
      context.commit('changeUserInfo', {
        attr,
        val
      })
    }
  }


}
