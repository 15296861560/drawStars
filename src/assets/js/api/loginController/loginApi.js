/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-29 00:35:33
 */
/*登录相关接口*/
import {
  $axios
} from "@/assets/js/axios-api/axios-config.js";

/**
 * @description: 通过密码登录
 * @param {
 * phone:String,
 * password:String
 * } params
 * @return {*}
 * @author: lgy
 */
function loginByPassword(params) {
  return new Promise((resolve, reject) => {
    $axios(params, "/loginApi/loginByPassword").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}

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
function registerByPhone(params) {
  return new Promise((resolve, reject) => {
    $axios(params, "/loginApi/registerByPhone").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}
export {
  loginByPassword,
  registerByPhone
};