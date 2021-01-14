export default {
  state: {
    userName: "666",
    userCode: "",
    url: "",
    userId: 0,
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
    getUserCode(state) {
      return state.userCode
    },
    getUserName(state) {
      return state.userName
    },
    getUrl(state) {
      return state.url
    },
    getUserId(state) {
      return state.userId
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
