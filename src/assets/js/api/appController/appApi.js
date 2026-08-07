import {
  $axios,
  $axiosGet,
  requests
} from '@/assets/js/axios-api/axios-config.js'

const appApi = {
  /**
   * 查询应用列表
   * @param {Object} params - 查询参数
   * @returns {Promise} - 返回应用列表
   */
  queryAppList: params => $axiosGet(params, `/appApi/list`),

  /**
   * 获取应用详情
   * @param {String} id - 应用ID
   * @returns {Promise} - 返回应用详情
   */
  getAppDetailById: id => $axiosGet({}, `/appApi/detail/${id}`),

  /**
   * 创建应用
   * @param {Object} app - 应用信息
   * @returns {Promise} - 返回创建结果
   */
  createApp: app => $axios(app, `/appApi/create`),

  /**
   * 更新应用
   * @param {Object} data - 应用信息
   * @returns {Promise} - 返回更新结果
   */
  updateApp: data =>
    requests({ url: `/api/appApi/update`, data, method: 'put' }),

  /**
   * 删除应用
   * @param {String} id - 应用ID
   * @returns {Promise} - 返回删除结果
   */
  deleteApp: id =>
    requests({ url: `/api/appApi/delete/${id}`, method: 'delete' }),

  /**
   * 批量删除应用
   * @param {Array} ids - 应用ID数组
   * @returns {Promise} - 返回批量删除结果
   */
  batchDeleteApp: ids =>
    requests({ url: `/api/appApi/batchDelete`, data: ids, method: 'delete' }),

  /**
   * 升级应用
   * @param {String} id - 应用ID
   * @returns {Promise} - 返回升级结果
   */
  upgradeApp: data =>
    requests({
      url: `/api/appApi/upgrade/${data.id}`,
      data,
      method: 'post'
    }),

  /**
   * 发布应用
   * @param {String} id - 应用ID
   * @returns {Promise} - 返回发布结果
   */
  publishApp: id =>
    requests({ url: `/api/appApi/publish/${id}`, method: 'post' })
}

export default appApi
