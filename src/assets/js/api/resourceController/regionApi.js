/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-29 00:33:33
 */
/*地理信息相关接口*/
import {
  $axiosGet
} from "@/assets/js/axios-api/axios-config.js";

const cacheOption = {
  cacheFrom: "fromLocalCache",
  cacheDuration: 1000 * 60 * 60 * 24
}


function queryPovinceList() {
  return new Promise((resolve, reject) => {
    $axiosGet({}, "/resourceApi/getPovinceList", cacheOption).then((res) => {
      setTimeout(() => {
        resolve(res)
      }, 500)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryCityList(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/resourceApi/getCityList", cacheOption).then((res) => {
      setTimeout(() => {
        resolve(res)
      }, 500)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryAreaList(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/resourceApi/getAreaList", cacheOption).then((res) => {
      setTimeout(() => {
        resolve(res)
      }, 500)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryTownList(params) {
  return new Promise((resolve, reject) => {
    $axiosGet(params, "/resourceApi/getTownList", cacheOption).then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}
export {
  queryPovinceList,
  queryCityList,
  queryAreaList,
  queryTownList
};