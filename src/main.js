// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vuex from 'vuex'
import store from '@/vuex'
import '@/components/dragAndDropComponents/custom-component' // 注册可视化拖拽自定义组件

import Navigation from "@/components/Navigation.vue";
import Myfooter from "@/components/Myfooter.vue";

import BaiduMap from 'vue-baidu-map'

var echarts = require("echarts");
Vue.prototype.$echarts = echarts
 


Vue.config.productionTip = false

Vue.use(ElementUI);
Vue.component('Navigation', Navigation)
Vue.component('Myfooter', Myfooter)
Vue.use(Vuex)
// 百度地图
Vue.use(BaiduMap, {
  ak: 'fLZT8N8BfIbR2eAyV4gGRE683PCFOZXn'
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  // components: { App },
  // template: '<App/>',
  render: h => h(App),
})

Vue.prototype.$vue = Vue;

