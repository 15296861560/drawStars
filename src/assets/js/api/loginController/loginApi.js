/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2023-10-06 22:10:49
 */
/* 登录相关接口 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  /**
   * @description: 通过密码登录
   * @param {
   * phone:String,
   * password:String
   * } params
   * @return {*}
   * @author: lgy
   */
  loginByPassword: params => $axios(params, '/loginApi/loginByPassword'),

  /**
   * @description: 通过验证码登录
   * @param {
   * phone:String,
   * captcha:String
   * } params
   * @return {*}
   * @author: lgy
   */
  loginBySMS: params => $axios(params, '/loginApi/loginBySMS'),

  /**
   * @description: 手机号注册
   * @param {
   * phone:String,
   * nickname:String,
   * password:String
   * } params
   * @return {*}
   * @author: lgy
   */
  registerByPhone: params => $axios(params, '/loginApi/registerByPhone'),

  /**
   * @description: 通过token查询用户信息
   * @param {
   * token:String,
   * }
   * @return {*}
   * @author: lgy
   */
  verifyLogin: async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const accessToken = searchParams.get('accessToken')

    const res = await $axiosGet(
      {
        accessToken
      },
      '/loginApi/verifyLogin'
    )
    return res
  },

  /**
   * @description: 获取验证码
   * @param {
   * type:String,
   * account:String,
   * }
   * @return {*}
   * @author: lgy
   */
  getCaptcha: param => $axiosGet(param, '/loginApi/getCaptcha')
}
