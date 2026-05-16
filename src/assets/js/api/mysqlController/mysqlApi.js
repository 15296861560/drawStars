/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-12-17 23:09:28
 */
/* mysql数据库操作相关接口 */
import { $axios } from '@/assets/js/axios-api/axios-config.js'

export default {
  /**
   * @description: 查询
   * @param {} params
   * @return {*}
   * @author: lgy
   */
  query: params => $axios(params, '/mysqlApi/query'),

  /**
   * @description: 插入
   * @param {} params
   * @return {*}
   * @author: lgy
   */
  register: params => $axios(params, '/mysqlApi/register'),

  /**
   * @description: 删除
   * @param {} params
   * @return {*}
   * @author: lgy
   */
  cancel: params => $axios(params, '/mysqlApi/cancel'),

  /**
   * @description: 执行SQL
   * @param {} params
   * @return {*}
   * @author: lgy
   */
  excuteSQL: params => $axios(params, '/mysqlApi/sql')
}
