/* 个人资料 / 账号设置相关接口 */
import { $axios, $axiosGet } from '@/assets/js/axios-api/axios-config.js'

export default {
  queryUserInfo: id =>
    $axiosGet(
      {
        id
      },
      '/profileApi/queryUserInfo'
    ),

  updateUserInfo: userInfo => $axios(userInfo, '/profileApi/updateUserInfo'),

  uploadAvatar: formData => $axios(formData, '/profileApi/uploadAvatar'),

  deleteAvatar: param => $axios(param, '/profileApi/deleteAvatar'),

  changePassword: userInfo =>
    $axios(
      {
        id: userInfo.id,
        password: userInfo.password,
        newPassword: userInfo.newPassword
      },
      '/profileApi/changePassword'
    ),

  changePhone: param => $axios(param, '/profileApi/changePhone'),

  unbindPhone: param => $axios(param, '/profileApi/unbindPhone'),

  bindEmail: param => $axios(param, '/profileApi/bindEmail'),

  changeEmail: param => $axios(param, '/profileApi/changeEmail'),

  unbindEmail: param => $axios(param, '/profileApi/unbindEmail'),

  getCaptcha: param => $axios(param, '/profileApi/getCaptcha'),

  verifyCaptcha: param => $axios(param, '/profileApi/verifyCaptcha'),

  resetPassword: param => $axios(param, '/profileApi/resetPassword'),

  updateLoginPrefs: param => $axios(param, '/profileApi/updateLoginPrefs'),

  listOauthBinds: id =>
    $axiosGet(
      {
        id
      },
      '/profileApi/listOauthBinds'
    ),

  oauthBind: (platform, id) =>
    $axiosGet(
      {
        id
      },
      `/profileApi/oauthBind/${platform}`
    ),

  oauthUnbind: param => $axios(param, '/profileApi/oauthUnbind'),

  getNotifyPrefs: id =>
    $axiosGet(
      {
        id
      },
      '/profileApi/notifyPrefs'
    ),

  updateNotifyPrefs: param => $axios(param, '/profileApi/notifyPrefs'),

  myRoles: id =>
    $axiosGet(
      {
        id
      },
      '/profileApi/myRoles'
    ),

  deactivateAccount: param => $axios(param, '/profileApi/deactivateAccount'),

  deleteAccount: param => $axios(param, '/profileApi/deleteAccount')
}
