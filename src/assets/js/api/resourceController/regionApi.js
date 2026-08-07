/*
 * @Description:
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-10-07 17:24:28
 * @LastEditors: lgy
 * @LastEditTime: 2022-11-29 00:33:33
 */
/* 地理信息相关接口 */
import { $axiosGet } from '@/assets/js/axios-api/axios-config.js'

const cacheOption = {
  cacheFrom: 'fromLocalCache',
  cacheDuration: 1000 * 60 * 60 * 24
}

export default {
  queryPovinceList: () => {
    return new Promise((resolve, reject) => {
      $axiosGet({}, '/resourceApi/getPovinceList', cacheOption)
        .then(res => {
          setTimeout(() => {
            resolve(res)
          }, 500)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  queryCityList: params => {
    return new Promise((resolve, reject) => {
      $axiosGet(params, '/resourceApi/getCityList', cacheOption)
        .then(res => {
          setTimeout(() => {
            resolve(res)
          }, 500)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  queryAreaList: params => {
    return new Promise((resolve, reject) => {
      $axiosGet(params, '/resourceApi/getAreaList', cacheOption)
        .then(res => {
          setTimeout(() => {
            resolve(res)
          }, 500)
        })
        .catch(e => {
          reject(e)
        })
    })
  },

  queryTownList: params =>
    $axiosGet(params, '/resourceApi/getTownList', cacheOption)
}
