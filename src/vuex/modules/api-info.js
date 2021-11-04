export default {
  state: {
    url: "/api"
  },
  mutations: {
    changeApi(state, {
      attr,
      val
    }) {
      state[attr] = val
    }
  },
  getters: {
    getUrl(state) {
      return state.url
    },
  },
  actions: {
    changeApi(context, {
      attr,
      val
    }) {
      context.commit('changeApi', {
        attr,
        val
      })
    }
  }
}
