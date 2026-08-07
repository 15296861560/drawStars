/*
 * @Description: 网站流量统计
 */
import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'
import { apiInfoStore } from '@/stores/api-info'

export default {
  collect: params => $axios(params, '/analyticsApi/collect'),

  // 静默采集，避免失败弹 toast
  collectSilent(params) {
    try {
      const base = apiInfoStore().getURL.value || ''
      return requests
        .post(`${base}/analyticsApi/collect`, params)
        .catch(() => {})
    } catch {
      return Promise.resolve()
    }
  },

  listWebsites: params => $axiosGet(params || {}, '/analyticsApi/websites'),
  getWebsite: id => $axiosGet({}, `/analyticsApi/website/${id}`),
  createWebsite: params => $axios(params, '/analyticsApi/website'),
  updateWebsite: (id, params) =>
    requests
      .put(`${apiInfoStore().getURL.value}/analyticsApi/website/${id}`, params)
      .then(res => res.data),
  deleteWebsite: id =>
    requests
      .delete(`${apiInfoStore().getURL.value}/analyticsApi/website/${id}`)
      .then(res => res.data),
  resetWebsite: id => $axios({}, `/analyticsApi/website/${id}/reset`),

  getPageviews: (id, params) =>
    $axiosGet(params || {}, `/analyticsApi/website/${id}/pageviews`),
  getMetrics: (id, params) =>
    $axiosGet(params || {}, `/analyticsApi/website/${id}/metrics`),
  getStats: (id, params) =>
    $axiosGet(params || {}, `/analyticsApi/website/${id}/stats`),
  getActive: id => $axiosGet({}, `/analyticsApi/website/${id}/active`),
  getHomeCharts: params => $axiosGet(params || {}, '/analyticsApi/homeCharts')
}
