/*配置资料相关接口*/
import Vue from 'vue';


function queryPovinceList() {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axiosGet({}, "/resourceApi/getPovinceList").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryCityList(params) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axiosGet(params, "/resourceApi/getCityList").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryAreaList(params) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axiosGet(params, "/resourceApi/getAreaList").then((res) => {
      resolve(res)
    }).catch(e => {
      reject(e)
    });
  })
}

function queryTownList(params) {
  return new Promise((resolve, reject) => {
    Vue.prototype.$axiosGet(params, "/resourceApi/getTownList").then((res) => {
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
