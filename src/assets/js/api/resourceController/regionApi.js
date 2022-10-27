/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-10-27 22:02:17
 */
/*地理信息相关接口*/
import Vue from 'vue';

const cacheOption = {
  cacheFrom: "fromLocalCache",
  cacheDuration: 1000 * 60 * 60 * 24
}


function queryPovinceList() {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axiosGet({}, "/resourceApi/getPovinceList", cacheOption).then((res) => {
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
    Vue.prototype.$axiosGet(params, "/resourceApi/getCityList", cacheOption).then((res) => {
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
    Vue.prototype.$axiosGet(params, "/resourceApi/getAreaList", cacheOption).then((res) => {
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
    Vue.prototype.$axiosGet(params, "/resourceApi/getTownList", cacheOption).then((res) => {
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
