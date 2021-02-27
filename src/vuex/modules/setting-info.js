export default {
  state: {
    isComputer: true,
  },
  mutations: {
    changeSettingInfo(state, {
      attr,
      val
    }) {
      state[attr] = val
    }
  },
  getters: {
    getIsComputer(state) {
      return state.isComputer
    },
  },
  actions: {
    changeSettingInfo(context, {
      attr,
      val
    }) {
      context.commit('changeSettingInfo', {
        attr,
        val
      })
    }
  }


}
