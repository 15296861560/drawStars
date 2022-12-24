export default {
  state: {
    data:{},
    str:"",
    dataList:[],
    routeList:[],
  },
  mutations: {

  },
  getters: {
    getData(state) {
      return state.data
    },
    getStr(state) {
      return state.str
    },
    getDataList(state) {
      return state.dataList
    },
    getRouteList() {
      return state.routeList
    },
  },
  actions: {
    changeData(context, {
      attr,
      val
    }) {
      context.commit('changeData', {
        attr,
        val
      })
    }
  }


}
