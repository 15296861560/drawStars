/*
 * @Description: 日志相关接口
 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  // 查询登录日志
  queryLoginLogs: params => $axiosGet(params, '/logApi/queryLoginLogs'),

  // 查询操作日志
  queryOperationLogs: params => $axiosGet(params, '/logApi/queryOperationLogs'),

  // 查询业务日志
  queryBusinessLogs: params => $axiosGet(params, '/logApi/queryBusinessLogs'),

  // 查询接口日志
  queryApiLogs: params => $axiosGet(params, '/logApi/queryApiLogs'),

  // 查询性能日志
  queryPerformanceLogs: params =>
    $axiosGet(params, '/logApi/queryPerformanceLogs'),

  // 获取日志统计
  getLogStatistics: params => $axiosGet(params, '/logApi/getLogStatistics'),

  // 删除日志
  deleteLog: id => $axiosGet({ id }, '/logApi/deleteLog'),

  // 批量删除日志
  batchDeleteLogs: ids =>
    $axiosGet(
      { ids: Array.isArray(ids) ? ids.join(',') : ids },
      '/logApi/batchDeleteLogs'
    ),

  // 导出日志
  exportLogs: params => $axiosGet(params, '/logApi/exportLogs'),

  // 前端埋点上报
  track: params => $axios(params, '/logApi/track')
}
