/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-02-17 00:04:20
 */
/* 个人资料相关接口 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  // 通过id查询个人信息
  queryUserInfo: id =>
    $axiosGet(
      {
        id
      },
      '/profileApi/queryUserInfo'
    ),

  // 修改个人信息
  updateUserInfo: userInfo => $axios(userInfo, '/profileApi/updateUserInfo'),

  // 修改密码
  changePassword: userInfo =>
    $axios(
      {
        id: userInfo.id,
        password: userInfo.password,
        newPassword: userInfo.newPassword
      },
      '/profileApi/changePassword'
    ),

  // 修改手机号码
  changePhone: userInfo =>
    $axios(
      {
        id: userInfo.id,
        phone: userInfo.phone
      },
      '/profileApi/updateUserInfo'
    ),

  // 获取验证码
  getCaptcha: param => $axios(param, '/profileApi/getCaptcha'),

  // 验证验证码
  verifyCaptcha: param => $axios(param, '/profileApi/verifyCaptcha')
}
