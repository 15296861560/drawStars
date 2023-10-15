/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-27 01:09:58
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-27 01:11:02
 */
export default {
  state: {
    url: '/api'
  },
  mutations: {
    changeApi(state, {
      attr,
      val
    }) {
      state[attr] = val;
    }
  },
  getters: {
    getUrl(state) {
      return state.url;
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
      });
    }
  }
};