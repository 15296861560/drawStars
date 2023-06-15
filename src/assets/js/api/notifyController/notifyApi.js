/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-07-25 00:05:13
 * @LastEditors: lgy
 * @LastEditTime: 2023-06-15 23:48:10
 */
/*通知相关接口*/
import {
  $axios,
  $axiosGet
} from "@/assets/js/axios-api/axios-config.js";

/**
 * @description: 发送通知
 * @param {
 * } params
 * @return {*}
 * @author: lgy
 */
function sendNotify(params) {
  return new Promise((resolve, reject) => {
    $axios(params, "/notifyApi/sendNotify").then((res) => {
      if (res.status) {
        resolve(res)
      } else {
        reject(res)
      }
    });
  })
}


// 通过id查询通知详情
function queryNotifyById(id) {
  return new Promise((resolve, reject) => {
    const params = {
      id
    };
    $axiosGet(params, "/notifyApi/queryNotifyById").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

/**
 * @description: 查询某种类型通知
 * @param {
 * notifyType:string
 * } params
 * @return {*}
 * @author: lgy
 */
function queryNotifyByType(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/notifyApi/queryNotifyByType").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}


/**
 * @description: 查询所有通知
 * @param {
 * } params
 * @return {*}
 * @author: lgy
 */
function queryAllNotify(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/notifyApi/queryAllNotify").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

/**
 * @description: 查询某用户收到的所有通知
 * @param {
 * } params
 * @return {*}
 * @author: lgy
 */
function  queryMyAllNotify(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/notifyApi/queryMyAllNotify").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

/**
 * @description: 查询某用户收到的某种类型通知
 * @param {
 * notifyType:string
 * } params
 * @return {*}
 * @author: lgy
 */
function queryMyNotifyByType(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/notifyApi/queryMyNotifyByType").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

export {
  sendNotify,
  queryNotifyById,
  queryNotifyByType,
  queryMyNotifyByType,
  queryAllNotify,
  queryMyAllNotify
};