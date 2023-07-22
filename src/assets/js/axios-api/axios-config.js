/*
 * @Description: 
 * @Version: 2.0
 * @Autor: lgy
 * @Date: 2022-05-23 23:24:07
 * @LastEditors: lgy
 * @LastEditTime: 2023-07-22 23:11:09
 */
import axios from 'axios'

import {
  apiInfoStore
} from '@/stores/api-info'
import {
  userInfoStore
} from '@/stores/user-info'


import {
  ElMessage
} from 'element-plus'

import router from '@/router'

import reqCache from './cache.js'


const apiInfo = apiInfoStore()
const userInfo = userInfoStore()

const DEFAULT_TIMEOUT = 1000 * 60 * 2;


let api_base_url = '';

if (process.env.NODE_ENV === 'production') {
  api_base_url = 'http://127.0.0.1:8010/';
  apiInfo.changeApi('');
}

const requests = axios.create({
  baseURL: api_base_url,
});


requests.defaults.timeout = DEFAULT_TIMEOUT
requests.interceptors.request.use(
  config => {
    // console.log('请求拦截器', config)
    let token = userInfo.getToken.value;
    if (token) {
      //将token放到请求头发送给服务器,将tokenkey放在请求头中
      config.headers.accessToken = token;
    }
    return config
  }
)
requests.interceptors.response.use(
  response => {
    // console.log('回复拦截器', response)
    if (response.data && response.data.code && response.data.code === 'TOKEN-FAIL') {
      router.push({
        path: "/login",
      });
    }
    return response
  },
  err => {
    // console.log('报错拦截器',err)    
    return Promise.reject(err)
  }
)

let showError = function (errorMessage) {
  ElMessage({
    type: "error",
    message: errorMessage,
  });
}


const $axios = function (params, methodURL) {
  let promise = new Promise(function (resolve, reject) {
    let url = apiInfo.getURL.value;
    if (methodURL) url += methodURL;

    requests.post(url, params, {
      timeout: params.timeout || 30000
    }).then(res => {
      if (!res.data.status) {
        //统一配置请求成功但接口报错时的提示
        showError(res.data.msg);
      }
      resolve(res.data)
    }).catch(err => {
      let errObj = JSON.parse(JSON.stringify(err));
      if (errObj.response) {
        let status = errObj.response.status;
        switch (status) {
          case 400:
            showError("400(Bad request):请求无效 ");
            break;
          case 404:
            showError("404(Not Found):请求的资源不存在");
            break;
          case 500:
            showError("500(Internal Server Error):内部服务器错误");
            break;
          case 504:
            showError("504(Gateway Time-out):请求超时");
            break;
          default:
            showError(errObj.message);
        }
      } else {
        showError(errObj.message);
      }
      reject(err)
    })
  })
  return promise
}

let apiObj = reqCache();

const $axiosGet = function (params = {}, methodURL = "", options = {}) {
  let promise = new Promise(async function (resolve, reject) {
    let reqURL = apiInfo.getURL.value;
    methodURL && (reqURL += methodURL);
    let realURL = reqURL + "?";


    Object.keys(params).forEach(key => {
      realURL = `${realURL}${key}=${params[key]}&`
    })
    realURL = realURL.slice(0, -1);


    const cacheResp = await apiObj.beforeFetch(realURL, options);
    if (cacheResp) {
      resolve(cacheResp.data);
      return;
    }

    requests.get(reqURL, {
      params
    }, {
      timeout: params.timeout || 300000
    }).then(res => {
      res.status === 200 && apiObj.afterFetch(res, realURL, options);
      resolve(res.data)
    }).catch(err => {
      let errStr = JSON.stringify(err);
      showError(errStr)
      reject(err)
    })
  })
  return promise
}


export {
  $axios,
  $axiosGet
}