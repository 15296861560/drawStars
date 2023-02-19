/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-02-17 00:04:20
 */
/*个人资料相关接口*/
import {
  $axios,
  $axiosGet
} from "@/assets/js/axios-api/axios-config.js";

// 通过id查询个人信息
function queryUserInfo(id) {
  return new Promise((resolve, reject) => {
    let params = {
      id
    };
    $axiosGet(params, "/profileApi/queryUserInfo").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

// 修改个人信息
function updateUserInfo(userInfo) {
  return new Promise((resolve, reject) => {
    $axios(userInfo, "/profileApi/updateUserInfo").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

// 修改密码
function changePassword(userInfo) {
  let params = {
    id: userInfo.id,
    password: userInfo.password,
    newPassword: userInfo.newPassword
  }
  return new Promise((resolve, reject) => {
    $axios(params, "/profileApi/changePassword").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

// 修改手机号码
function changePhone(userInfo) {
  let params = {
    id: userInfo.id,
    phone: userInfo.phone,
  }
  return new Promise((resolve, reject) => {
    $axios(params, "/profileApi/updateUserInfo").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

// 获取验证码
function getCaptcha(param) {
  return new Promise((resolve, reject) => {
    $axios(param, "/profileApi/getCaptcha").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

// 验证验证码
function verifyCaptcha(param) {
  return new Promise((resolve, reject) => {
    $axios(param, "/profileApi/verifyCaptcha").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

export {
  queryUserInfo,
  updateUserInfo,
  changePassword,
  changePhone,
  getCaptcha,
  verifyCaptcha
};