/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-15 23:48:10
 */
/* 通知相关接口 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  /**
   * @description: 发送通知
   * @param {
   * } params
   * @return {*}
   * @author: lgy
   */
  sendNotify: params => $axios(params, '/notifyApi/sendNotify'),

  // 通过id查询通知详情
  queryNotifyById: id => $axiosGet({ id }, '/notifyApi/queryNotifyById'),

  /**
   * @description: 查询某种类型通知
   * @param {
   * notifyType:string
   * } params
   * @return {*}
   * @author: lgy
   */
  queryNotifyByType: params =>
    $axiosGet(params, '/notifyApi/queryNotifyByType'),

  /**
   * @description: 查询所有通知
   * @param {
   * } params
   * @return {*}
   * @author: lgy
   */
  queryAllNotify: params => $axiosGet(params, '/notifyApi/queryAllNotify'),

  /**
   * @description: 查询某用户收到的所有通知
   * @param {
   * } params
   * @return {*}
   * @author: lgy
   */
  queryMyAllNotify: params => $axiosGet(params, '/notifyApi/queryMyAllNotify'),

  /**
   * @description: 查询某用户收到的某种类型通知
   * @param {
   * notifyType:string
   * } params
   * @return {*}
   * @author: lgy
   */
  queryMyNotifyByType: params =>
    $axiosGet(params, '/notifyApi/queryMyNotifyByType')
}
