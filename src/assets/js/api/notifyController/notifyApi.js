/*
 * @Description: 站内信 / 用户通知接口
 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  /**
   * 发送通知
   * @param {{ receiveId?: number|string, receiveIds?: Array<number|string>, notifyType?: string, notifyMsg?: string, content?: string }} params
   */
  sendNotify: params => $axios(params, '/notifyApi/sendNotify'),

  /** 通过 id 查询通知详情 */
  queryNotifyById: id =>
    $axiosGet({ notifyId: id }, '/notifyApi/queryNotifyById'),

  /**
   * 查询某种类型通知
   * @param {{ notifyType: string }} params
   */
  queryNotifyByType: params =>
    $axiosGet(params, '/notifyApi/queryNotifyByType'),

  /** 查询所有通知 */
  queryAllNotify: params => $axiosGet(params || {}, '/notifyApi/queryAllNotify'),

  /**
   * 查询当前用户收到的通知（支持筛选与分页）
   * @param {{ userId?: number|string, status?: 'all'|'read'|'unread', curPage?: number, pageSize?: number }} params
   */
  queryMyAllNotify: params =>
    $axiosGet(params || {}, '/notifyApi/queryMyAllNotify'),

  /**
   * 查询当前用户某类型通知
   * @param {{ notifyType: string, userId?: number|string }} params
   */
  queryMyNotifyByType: params =>
    $axiosGet(params, '/notifyApi/queryMyNotifyByType'),

  /** 未读数量 */
  getUnreadCount: params =>
    $axiosGet(params || {}, '/notifyApi/unreadCount'),

  /** 单条已读 */
  markRead: params => $axios(params, '/notifyApi/markRead'),

  /** 全部已读 */
  markAllRead: params => $axios(params || {}, '/notifyApi/markAllRead')
}
