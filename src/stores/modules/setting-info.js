export default {
  state: {
    // 语言
    language: 'zh',
  },
  mutations: {
    changeSettingInfo(state, {
      attr,
      val
    }) {
      state[attr] = val;
    }
  },
  getters: {
    getLanguage(state) {
      return state.language;
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
      });
    }
  }


};
