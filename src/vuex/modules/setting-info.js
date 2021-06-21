export default {
  state: {
    //判断是否是电脑
    isComputer: true,
    // 侧边栏收缩
    isCollapse:false,
    // 语言
    language: "zh",
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
    getIsCollapse(state) {
      return state.isCollapse
    },
    getLanguage(state) {
      return state.language
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
