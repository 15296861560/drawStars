/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-11-24 22:05:22
 * @LastEditors: lgy
 * @LastEditTime: 2023-02-07 22:27:51
 */
/*个人资料相关接口*/
import {
  $axios,
  $axiosGet
} from "@/assets/js/axios-api/axios-config.js";

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

export {
  queryUserInfo,
  updateUserInfo,
  changePassword,
  changePhone
};