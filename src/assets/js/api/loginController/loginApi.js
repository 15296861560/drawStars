/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2023-10-06 22:10:49
 */
/*登录相关接口*/
import {
  $axios,
  $axiosGet
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
async function loginByPassword(params) {
  const res = await $axios(params, "/loginApi/loginByPassword");
  return res;
}

/**
 * @description: 通过验证码登录
 * @param {
 * phone:String,
 * captcha:String
 * } params
 * @return {*}
 * @author: lgy
 */
async function loginBySMS(params) {
  const res = await $axios(params, "/loginApi/loginBySMS");
  return res;
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
async function registerByPhone(params) {
  const res = await $axios(params, "/loginApi/registerByPhone");
  return res;
}

/**
 * @description: 通过token查询用户信息
 * @param {
 * token:String,
 * } 
 * @return {*}
 * @author: lgy
 */
async function verifyLogin() {
  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = searchParams.get('accessToken');

  const res = await $axiosGet({
    accessToken
  }, "/loginApi/verifyLogin");
  return res;
}

/**
 * @description: 获取验证码
 * @param {
 * type:String,
 * account:String,
 * } 
 * @return {*}
 * @author: lgy
 */
async function getCaptcha(param) {
  const res = await $axiosGet(param, "/loginApi/getCaptcha");
  return res;
}
export {
  loginByPassword,
  registerByPhone,
  verifyLogin,
  getCaptcha,
  loginBySMS
};