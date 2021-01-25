import Vue from 'vue';
import Vuex from 'vuex';
import UserInfo from './modules/user-info';
import Mutations from './mutations'
import Getters from './getters'
import State from './state'
Vue.use(Vuex)
const store = new Vuex.Store({
  // strict:true,
    state: State,      
    getters:Getters,
    mutations:Mutations,
    modules:{userInfo:UserInfo}
    
  })
export default store