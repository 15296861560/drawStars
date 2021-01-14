// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vuex from 'vuex'
import store from '@/vuex'

import Navigation from "@/components/Navigation.vue";
import Myfooter from "@/components/Myfooter.vue";


Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.component('Navigation', Navigation)
Vue.component('Myfooter', Myfooter)
Vue.use(Vuex)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

Vue.prototype.$vue = Vue;

