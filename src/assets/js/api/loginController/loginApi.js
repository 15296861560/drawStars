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
   * @description: 游客快捷注册（心智测评 5.6.2 前置条件二）
   * @param {
   * phone:String,
   * captcha:String,
   * nickname:String,
   * pointsScenario:String,  // ASSESSMENT_COMPLETE / ASSESSMENT_POSTER
   * responseId:String,      // 补领答卷 id（场景 B）
   * source:String, refId:String  // 注册事件继承渠道
   * } params
   * @return {*}
   * @author: lgy
   */
  quickRegister: params => $axios(params, '/loginApi/quickRegister'),

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
    const params = {}
    if (accessToken) {
      params.accessToken = accessToken
    }

    // 未登录/退出后探测会话是预期失败，由调用方静默处理，不弹全局错误
    const res = await $axiosGet(params, '/loginApi/verifyLogin', {
      hideErrorTip: true
    })
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
  getCaptcha: param => $axiosGet(param, '/loginApi/getCaptcha'),

  resetPassword: param => $axios(param, '/loginApi/resetPassword')
}
