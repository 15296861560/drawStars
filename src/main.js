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
import '@/assets/js/db/sqlite.js' // 定义sqlite常用操作
import '@/assets/js/axios-api/axios-config.js' //封装请求

import Navigation from "@/components/Navigation.vue";
import Myfooter from "@/components/Myfooter.vue";

//多语言
import i18n from './lang'

var echarts = require("echarts");
Vue.prototype.$echarts = echarts



Vue.config.productionTip = false

Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
});
Vue.component('Navigation', Navigation)
Vue.component('Myfooter', Myfooter)
Vue.use(Vuex)
// 百度地图
import BaiduMap from 'vue-baidu-map'
Vue.use(BaiduMap, {
  ak: 'fLZT8N8BfIbR2eAyV4gGRE683PCFOZXn'
})

const VueObject = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  // components: { App },
  // template: '<App/>',
  render: h => h(App),
})

Vue.prototype.$vue = VueObject;
